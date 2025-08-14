{-# LANGUAGE OverloadedStrings #-}

-- Minimal, standalone tests for the fitness function

-- Types aligned with main code
data Lecture = Lecture
  { lectureId' :: String
  , lectureCourseId' :: String
  , lectureTitle' :: String
  , lectureEnrollment' :: Int
  } deriving (Show, Eq)

data Room = Room
  { roomId' :: String
  , roomName' :: String
  , roomCapacity' :: Int
  } deriving (Show, Eq)

data TimeSlot = TimeSlot
  { timeSlotId' :: String
  , timeSlotDay' :: String
  , timeSlotStart' :: String
  , timeSlotEnd' :: String
  } deriving (Show, Eq)

data Assignment = Assignment
  { aLecture :: Lecture
  , aRoom :: Room
  , aTimeSlot :: TimeSlot
  } deriving (Show, Eq)

type Chromosome = [Assignment]

getCapacity :: Room -> Int
getCapacity = roomCapacity'

getEnrollment :: Lecture -> Int
getEnrollment = lectureEnrollment'

getRoomId :: Room -> String
getRoomId = roomId'

getTimeSlotId :: TimeSlot -> String
getTimeSlotId = timeSlotId'

-- Fitness: +1 per capacity-fit; -1 per room/time conflict (i<j to avoid double count)
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

-- Test data
lecture1 = Lecture "L1" "C1" "Algebra" 20
lecture2 = Lecture "L2" "C2" "History" 15
roomA = Room "R1" "RoomA" 30
roomB = Room "R2" "RoomB" 15
timeslot1 = TimeSlot "T1" "Mon" "09:00" "10:00"
timeslot2 = TimeSlot "T2" "Tue" "10:00" "11:00"

assignment1 = Assignment lecture1 roomA timeslot1
assignment2 = Assignment lecture2 roomB timeslot2

chromosomeNoConflict = [assignment1, assignment2]  -- No conflict, capacities fit
chromosomeConflict = [assignment1, Assignment lecture2 roomA timeslot1]  -- Room + time conflict

check :: String -> Int -> Int -> IO ()
check label actual expected =
  if actual == expected
    then putStrLn $ "Test passed (" ++ label ++ ")"
    else error $ "Test FAILED (" ++ label ++ "): expected " ++ show expected ++ ", got " ++ show actual

main :: IO ()
main = do
  putStrLn "Running unit tests for fitness..."
  check "no conflict, all fit" (fitness chromosomeNoConflict) 2
  check "room/time conflict" (fitness chromosomeConflict) 1
  putStrLn "All tests passed."