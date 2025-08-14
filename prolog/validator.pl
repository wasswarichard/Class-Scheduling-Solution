% SWI-Prolog validator for class scheduling
% Reads facts from stdin:
%   room(Id, Capacity).
%   lecture(Id, CourseId, Enrollment).
%   timeslot(Id, Day, Start, End).
%   assignment(LectureId, RoomId, TimeSlotId).
% Emits JSON: {"valid": Bool, "violations": [ {code, message, lectureId, roomId, timeSlotId}, ... ] }

:- module(validator, [main/0]).
:- use_module(library(readutil)).
:- use_module(library(http/json)).

:- dynamic room/2.
:- dynamic lecture/3.
:- dynamic timeslot/4.
:- dynamic assignment/3.

main :-
    read_and_assert_facts,
    collect_violations(Vs),
    ( Vs = [] -> Valid = true ; Valid = false ),
    Result = _{valid:Valid, violations:Vs},
    json_write_dict(current_output, Result, [width(0)]), nl,
    halt(0).

read_and_assert_facts :-
    set_prolog_flag(tty_control, false),
    setup_call_cleanup(
        true,
        read_terms_loop,
        true
    ).

read_terms_loop :-
    read_term(user_input, Term, []),
    ( Term == end_of_file -> true
    ; assert_if_fact(Term),
      read_terms_loop
    ).

assert_if_fact(Term) :-
    ( Term = room(Id,Cap) -> assertz(room(Id,Cap))
    ; Term = lecture(Id,CourseId,Enroll) -> assertz(lecture(Id,CourseId,Enroll))
    ; Term = timeslot(Id,Day,Start,End) -> assertz(timeslot(Id,Day,Start,End))
    ; Term = assignment(Lect,Room,TS) -> assertz(assignment(Lect,Room,TS))
    ; true % ignore unknown terms
    ).

collect_violations(Vs) :-
    findall(V, violation(V), VList),
    Vs = VList.

violation(V) :- capacity_violation(V).
violation(V) :- double_booking_violation(V).
violation(V) :- same_course_overlap_violation(V).

capacity_violation(_{code:"capacity_exceeded", message:Msg, lectureId:L, roomId:R, timeSlotId:TS}) :-
    assignment(L,R,TS),
    lecture(L,_Course,Enroll),
    room(R,Cap),
    Enroll > Cap,
    format(string(Msg), 'Enrollment (~w) exceeds room capacity (~w).', [Enroll,Cap]).

% No two different lectures in the same room and same timeslot
double_booking_violation(_{code:"room_double_booked", message:Msg, lectureId:L1, roomId:R, timeSlotId:TS}) :-
    assignment(L1,R,TS),
    assignment(L2,R,TS),
    L1 \= L2,
    order_pair(L1,L2,L1,_),
    format(string(Msg), 'Room booked by multiple lectures at the same time: ~w and ~w.', [L1,L2]).

% Lectures of same course cannot overlap in same timeslot
same_course_overlap_violation(_{code:"same_course_overlap", message:Msg, lectureId:L1, roomId:R1, timeSlotId:TS}) :-
    assignment(L1,R1,TS),
    assignment(L2,_R2,TS),
    L1 \= L2,
    lecture(L1,C,_), lecture(L2,C,_),
    order_pair(L1,L2,L1,_),
    format(string(Msg), 'Two lectures of the same course overlap: ~w and ~w.', [L1,L2]).

order_pair(A,B,Min,Max) :- (A@<B -> Min=A, Max=B ; Min=B, Max=A).
