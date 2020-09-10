use PAWS;

insert into Restrictions values
    (null, "Experienced 'blue' dog walker; 20+ hours experience with 'blue' dogs", true),
    (null, "Difficult to leash.  Ask for staff assistance.", false),
    (null, "Has a resource.  Ask for staff assistance leashing.", false),
    (null, "Special handling instructions.  Talk with Behavior Group before leashing.", false),
    (null, "Experienced 'blue' dog walker; 30+ hours experience with 'blue' dogs", true);

insert into Animals values
    (null, true, "dog", "Geronimo", "blue", 10, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Hidalgo", "blue", 20, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Moety", "blue", 30, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Sonny", "green", 40, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Chloe", "green", 50, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Kuj", "orange", 50, null, "Bill", "2020-09-05"),
    (null, true, "cat", "Digger", "blue", 10, null, "Bill", "2020-09-05"),
    (null, true, "cat", "Chulupa", "green", 20, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Chardonnay", "green", 11, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Reisling", "orange", 21, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Patsy", "red", 31, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Chandler", "orange", 41, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Phoebe", "purple", 51, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Joey", "black", 12, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Ross", "black", 22, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Monica", "red", 32, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Rachel", "blue", 42, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Strangelove", "purple", 52, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Quinn", "green", 13, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Jeckyl", "red", 23, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Dr. Zhivago", "blue", 33, null, "Bill", "2020-09-05"),
    (null, true, "dog", "Buddy", "blue", 43, null, "Bill", "2020-09-06"),
    (null, true, "dog", "Anatole", "blue", 53, null, "Bill", "2020-09-06"),
    (null, true, "dog", "Buddy", "green", 14, null, "Bill", "2020-09-06"),
    (null, true, "dog", "Bullwinkle", "orange", 24, null, "Bill", "2020-09-06"),
    (null, true, "dog", "Buddy", "blue", 34, null, "Bill", "2020-09-05");

insert into AnimalRestrictions values
    (1, 1),
    (23, 1),
    (2, 1),
    (17, 2),
    (17, 3),
    (17, 4);

