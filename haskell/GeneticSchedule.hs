{-# LANGUAGE PackageImports #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

import qualified "bytestring" Data.ByteString.Lazy as BL
import Data.Aeson
import GHC.Generics
import Control.Monad (replicateM)
import System.Random (randomRIO)
import Data.List (sortOn)
import Data.Ord (Down(..))

-- Input domain types matching Java JSON schema
-- Java: Course{id, name}
--       Lecture{id, courseId, title, enrollment}
--       Room{id, name, capacity}
--       TimeSlot{id, day, start, end}
-- Top-level: SchedulingProblem{courses, lectures, rooms, timeSlots}

data Course = Course
  { courseId' :: String
  , courseName' :: String
  } deriving (Show, Eq)

instance FromJSON Course where
  parseJSON = withObject "Course" $ \o ->
    Course <$> o .: "id"
           <*> o .: "name"

getCourseId :: Course -> String
getCourseId = courseId'

-- We name fields with suffixes to avoid clashes with Prelude.id
-- and to keep decoding explicit

data Lecture = Lecture
  { lectureId' :: String
  , lectureCourseId' :: String
  , lectureTitle' :: String
  , lectureEnrollment' :: Int
  } deriving (Show, Eq)

instance FromJSON Lecture where
  parseJSON = withObject "Lecture" $ \o ->
    Lecture <$> o .: "id"
            <*> o .: "courseId"
            <*> o .: "title"
            <*> o .: "enrollment"

getLectureId :: Lecture -> String
getLectureId = lectureId'

getEnrollment :: Lecture -> Int
getEnrollment = lectureEnrollment'

data Room = Room
  { roomId' :: String
  , roomName' :: String
  , roomCapacity' :: Int
  } deriving (Show, Eq)

instance FromJSON Room where
  parseJSON = withObject "Room" $ \o ->
    Room <$> o .: "id"
         <*> o .: "name"
         <*> o .: "capacity"

getRoomId :: Room -> String
getRoomId = roomId'

getCapacity :: Room -> Int
getCapacity = roomCapacity'

data TimeSlot = TimeSlot
  { timeSlotId' :: String
  , timeSlotDay' :: String
  , timeSlotStart' :: String
  , timeSlotEnd' :: String
  } deriving (Show, Eq)

instance FromJSON TimeSlot where
  parseJSON = withObject "TimeSlot" $ \o ->
    TimeSlot <$> o .: "id"
             <*> o .: "day"
             <*> o .: "start"
             <*> o .: "end"

getTimeSlotId :: TimeSlot -> String
getTimeSlotId = timeSlotId'

-- Top-level input wrapper

data SchedulingProblem = SchedulingProblem
  { inCourses :: [Course]
  , inLectures :: [Lecture]
  , inRooms :: [Room]
  , inTimeSlots :: [TimeSlot]
  } deriving (Show, Eq)

instance FromJSON SchedulingProblem where
  parseJSON = withObject "SchedulingProblem" $ \o ->
    SchedulingProblem <$> o .: "courses"
                      <*> o .: "lectures"
                      <*> o .: "rooms"
                      <*> o .: "timeSlots"

-- Internal GA representation

data Assignment = Assignment
  { aLecture :: Lecture
  , aRoom :: Room
  , aTimeSlot :: TimeSlot
  } deriving (Show, Eq)

type Chromosome = [Assignment]

-- Output types to match Java Schedule
-- Java Schedule: { assignments: [Assignment], score }
-- Java Assignment: { lectureId, roomId, timeSlotId }

data AssignmentOut = AssignmentOut
  { lectureId :: String
  , roomId :: String
  , timeSlotId :: String
  } deriving (Show, Generic)

instance ToJSON AssignmentOut

data ScheduleOut = ScheduleOut
  { assignments :: [AssignmentOut]
  , score :: Maybe Double
  } deriving (Show, Generic)

instance ToJSON ScheduleOut

assignmentToOut :: Assignment -> AssignmentOut
assignmentToOut a = AssignmentOut
  { lectureId = getLectureId (aLecture a)
  , roomId = getRoomId (aRoom a)
  , timeSlotId = getTimeSlotId (aTimeSlot a)
  }

-- Random construction
randomAssignment :: [Room] -> [TimeSlot] -> Lecture -> IO Assignment
randomAssignment rooms timeSlots lecture = do
  r <- randomRIO (0, length rooms - 1)
  t <- randomRIO (0, length timeSlots - 1)
  pure $ Assignment lecture (rooms !! r) (timeSlots !! t)

randomChromosome :: [Lecture] -> [Room] -> [TimeSlot] -> IO Chromosome
randomChromosome lectures rooms timeSlots =
  mapM (randomAssignment rooms timeSlots) lectures

-- Fitness: +1 per assignment that fits room capacity; -1 per room/time conflict
-- Fixed: avoid double-counting conflicts by using i<j pairs
fitness :: Chromosome -> Int
fitness chrom =
  let fits = [ if getCapacity (aRoom a) >= getEnrollment (aLecture a) then 1 else 0 | a <- chrom ]
      indexed = zip [0..] chrom
      conflicts = length
        [ ()
        | (i, a1) <- indexed
        , (j, a2) <- indexed
        , i < j
        , getRoomId (aRoom a1) == getRoomId (aRoom a2)
        , getTimeSlotId (aTimeSlot a1) == getTimeSlotId (aTimeSlot a2)
        ]
  in sum fits - conflicts

-- Selection: take top n by fitness
selectBest :: [(Chromosome, Int)] -> Int -> [Chromosome]
selectBest pop n = map fst $ take n $ sortOn (Down . snd) pop

-- Crossover: element-wise choose from parents (expects same order/size)
crossover :: Chromosome -> Chromosome -> IO Chromosome
crossover c1 c2 =
  mapM (\(a1, a2) -> do
           useA1 <- randomRIO (False, True)
           pure $ if useA1 then a1 else a2
       ) (zip c1 c2)

-- Mutation: reassign one random lecture to a random room/time
mutate :: [Room] -> [TimeSlot] -> Chromosome -> IO Chromosome
mutate rooms timeSlots chrom
  | null chrom = pure chrom
  | otherwise = do
      idx <- randomRIO (0, length chrom - 1)
      let (before, a:after) = splitAt idx chrom
      newAssignment <- randomAssignment rooms timeSlots (aLecture a)
      pure $ before ++ [newAssignment] ++ after

-- One generation demo (can be extended to multiple generations if needed)
geneticStep :: [Lecture] -> [Room] -> [TimeSlot] -> Int -> IO Chromosome
geneticStep lectures rooms timeSlots populationSize = do
  pop <- replicateM populationSize (randomChromosome lectures rooms timeSlots)
  let scored = [(c, fitness c) | c <- pop]
      keepN  = max 2 (populationSize `div` 2)
      best   = selectBest scored keepN
  children <- mapM (\(p1, p2) -> crossover p1 p2) (zip best (reverse best))
  mutated  <- mapM (mutate rooms timeSlots) children
  let newPop = best ++ mutated
      final  = selectBest [(c, fitness c) | c <- newPop] 1
  pure (head final)

main :: IO ()
main = do
  input <- BL.getContents
  case eitherDecode input :: Either String SchedulingProblem of
    Left err -> do
      -- Print a JSON error for consistency (stderr would be preferable, but HaskellGAClient
      -- only reads stdout; returning non-zero is handled in the shell wrapper if this is compiled)
      BL.putStr $ encode $ object ["error" .= ("Error parsing JSON: " <> err)]
    Right problem -> do
      let cs = inCourses problem
          ls = inLectures problem
          rs = inRooms problem
          ts = inTimeSlots problem
      -- Run a small population; adjust as needed
      scheduleChrom <- geneticStep ls rs ts 20
      let sc = fromIntegral (fitness scheduleChrom) :: Double
          out = ScheduleOut { assignments = map assignmentToOut scheduleChrom
                            , score = Just sc
                            }
      BL.putStr (encode out)