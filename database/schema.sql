-- create database PAWS;
use PAWS;

create table Animals
(   --  Master table of animals in the shelter

    animalId        smallint (6)
                    auto_increment
                    not null
                    unique,

    active          boolean
                    not null
                    default true,

    species         varchar (6)
                    not null
                    default "dog",

    name            varchar (20)
                    not null,

    color           varchar (6)
                    not null
                    default "black",

    add_restrict    tinyint (2)
                    default null,

    cage_num        tinyint(3)
                    default null,

    change_by       smallint (6)
                    not null,

    change_date     date
                    not null,

    primary key (animalId)
)
auto_increment = 0;

insert into Animals values
    (null, true, "dog", "Geronimo", "blue", 20, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Hidalgo", "blue", 20, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Moety", "blue", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Sonny", "green", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Chloe", "green", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Kuj", "orange", "", null, "Bill", "2020-09-05"),
    (null, true, "cat", "Digger", "blue", "", null, "Bill", "2020-09-05"),
    (null, true, "cat", "Chulupa", "green", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Chardonnay", "green", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Reisling", "orange", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Patsy", "red", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Chandler", "orange", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Phoebe", "purple", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Joey", "black", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Ross", "black", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Monica", "red", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Rachel", "blue", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Strangelov", "purple", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Quinn", "green", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Jeckyl", "red", "", null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Zhivago", "blue", "", null, "Bill", "2020-09-05")
