-- create database PAWS;
use PAWS;

create table if not exists Colors
(   --  'Master' table of colors, used to define options for the application

    color           varchar (6)
                    unique
                    not null,

    sort            tinyint (2)
                    unique
                    not null,

    primary key (color)
);

create table if not exists Comments
(   --  All the animal handling comments entered by users of the application.

    commentId       tinyint (2)
                    auto_increment
                    not null
                    unique,

    comment         text
                    not null,

    type_of         enum ("behavior",
                          "color test",
                          "information",
                          "medical",
                          "public"),

    primary key (commentId)
);

create table if not exists Restrictions
(   --  'Master' table of additional restrictions
    --
    --  These entries DO NOT DEFINE the restriction, rather they are text describing the
    --  restriction.  If a restriction is applied to an animal, the application will require the
    --  restriction be applied to a person for them to be authorized.
    --
    --  Restrictions are are implemented in the application as a <select> or <input> element.

    restrictId      tinyint (2)
                    auto_increment
                    unique
                    not null,

    restriction     varchar (75)
                    not null,

    testable        boolean
                    default true,

    cats            boolean                 --  Does this restriction apply to cats?
                    default false,

    dogs            boolean                 --  Does this restriction apply to dogs?
                    default false,

    primary key (restrictId)
);

-- *********************************************************************************************
-- *********************************************************************************************

--  The following table pertain to animals

create table if not exists Animals
(   --  'Master' table of animals in the shelter

    animalId        smallint (6)
                    auto_increment
                    not null
                    unique,

    active          boolean                     --  Soft delete.  The animal is no longer at the shelter but the data is kept
                    not null                    --  in the database to preserve the history and integrity.
                    default true,

    available       boolean                     --  Indicates the animal is temporarilly not available.  Perhaps because someone
                    default false,              --  is walking with it now?

    species         varchar (6)
                    not null
                    default "dog",

    name            varchar (20)
                    not null,

    color           varchar (6)
                    not null
                    default "black",

    cage_num        tinyint(3)
                    default null,

    image           varchar (70)
                    default null,

    change_by       smallint (6)
                    not null,

    change_date     date
                    not null,

    primary key (animalId)
);

create table if not exists AnimalRestrictions
(   --  List of additional resrictins associated with individual animals
    --
    --  Additional restrictions is potentially a many-to-one relationship.  One animal
    --  may have multiple additional restrictions
    
    animalId        smallint (6)
                    not null,

    restrictId      tinyint (2)
                    not null,

    primary key (animalId, restrictId),
    foreign key (animalId) references Animals (animalId),
    foreign key (restrictId) references Restrictions (restrictId)
);

create table if not exists WalkingNotes
(   --  Notes about animals entered by users

    noteId          int(9)
                    auto_increment
                    not null
                    unique,

    peopleId        smallint (6)
                    not null,

    animalId        smallint (6)
                    not null,

    color           varchar (6)                     --  If this notes is comments from a 'color tester', this is the color
                    default "black",                --  the tester sugggests for the animal.  Otherwise the value is 'null'
                    
    public          boolean                         --  Are this note intended to be accessable to the general public?
                    not null
                    default false,

    created         datetime
                    not null,

    note            text
                    not null,

    primary key (noteId),
    foreign key (animalId) references Animals (animalId),
    foreign key (peopleId) references People (peopleId)
);

-- *********************************************************************************************
-- *********************************************************************************************

create table if not exists People
(   --  'Master' table of people

    peopleId        smallint (6)
                    auto_increment
                    not null
                    unique,

    active          boolean
                    not null
                    default true,

    lock_code       tinyint(3)
                    default 0,

    type_of         enum("staff",
                         "volunteer")
                    default "volunteer",

    surname         varchar (15)
                    not null,

    given           varchar (15)
                    not null,
                    
    middle          varchar (15)
                    default null,

    preferred       varchar (15)                --  What this person prefers to be called, perhaps a
                    default null,               --  nickname
                    
    email           varchar(30)                 --  Using e-mail addresses in lieu of a user id.  E-mail
                    unique                      --  addresses are unique, no two people in the world have
                    not null,                   --  the same e-mail address.

    volgistics      smallint (6)                --  Volgistics ID
                    unique                      --  If this ID is known, it can be used instead of an
                    default null,               --  e-mail address to login to PAWS.

    password        char (60)
                    not null,

    image           varchar (20)
                    default null,

    aboutme         text
                    default null,

    change_by       tinyint(6)
                    not null,

    change_date     date
                    not null,

    primary key (peopleId),
    index (email),
    index (volgistics)
);

create table if not exists ColorPermissions
(   --  A many-to-one table associating people with the animals they are allowed to interact with.
    --
    --  Color is the most basic level of permission.  A volunteer granted permission to a color is authorized to interact
    --  with any animal which has been assigned that same color.  This permission can be modified by granting or revoking
    --  permission to specific animals.
    
    id              smallint (6)
                    auto_increment
                    not null
                    unique,

    peopleId        smallint (6)
                    not null,

    species         varchar (6)
                    default "dog"
                    not null,

    color           varchar (6)
                    default "green"
                    not null,

    primary key (id),
    foreign key (peopleId) references People (peopleId)
);

create table if not exists AdditionalPermissions
(   --  List of additional permissions associated with individual people.  These permissions coorespond to the data
    --  in table Restrictions that are marked as 'testable'.  A person is not authorized to interact with an animal if
    --  a restriction has been associated with that animal and not associated with the person.
    --
    --  In other words:
    --  -   a restriction associated with an animal is an additional constraint beyond color
    --  -   a restriction associated with a person qualifies that person to interact with animals assigned the same
    --      restriction

    --  AdditionalRestrictions is a one-to-many relationship.  One person may have multiple additional permissions

    peopleId        smallint (6)
                    not null,

    restrictId      tinyint (2)
                    not null,

    primary key (peopleId, restrictId),
    foreign key (peopleId) references People (peopleId),
    foreign key (restrictId) references Restrictions (restrictId)
);

create table if not exists AnimalPrivledges
(   --  Explicitly permit/deny a person and an animal.  This overrides all other permission settings.

    peopleId        smallint (6)
                    not null,

    animalId        smallint (6)
                    not null,

    permit          boolean
                    not null
                    default false,

    adminId         smallint (6)
                    not null,

    added           datetime
                    not null,

    primary key (peopleId, animalId),
    foreign key (adminId) references People (peopleId),
    foreign key (animalId) references Animals (animalId),
    foreign key (peopleId) references People (peopleId)
);

create table if not exists AdminPrivledges
(
    adminId         tinyint (2)
                    auto_increment
                    not null
                    unique,

    privledge       varchar(45)
                    not null,

    primary key (adminId)
);

create table if not exists Administrators
(   --  This is the table that links people to admin privledges

    peopleId        smallint (6)
                    not null,

    adminId         tinyint (2)
                    not null,

    primary key (peopleId, adminId),
    foreign key (peopleId) references People (peopleId),
    foreign key (adminId) references AdminPrivledges (adminId)
);

-- *********************************************************************************************
-- *********************************************************************************************

create table if not exists Interactions
(   --  Although simple, this is the real meat and potatoes of the application...the time a person spent
    --  with one of the animals.

    id              int (12)
                    auto_increment
                    not null
                    unique,

    peopleId        smallint (6)
                    not null,

    animalId        smallint (6)
                    not null,

    start           datetime
                    not null,

    end             datetime
                    default null,

    primary key (id),
    foreign key (peopleId) references People (peopleId),
    foreign key (animalId) references Animals (animalId)
);