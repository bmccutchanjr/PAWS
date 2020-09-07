use PAWS;

-- select name, color from Animals where species="dog" order by name, color;
-- select * from Animals;
insert into Animals values
    (null, true, "dog", "Buddy", "blue", "", null, "Bill", "2020-09-06"),
    (null, true, "dog", "Anatole", "blue", 20, null, "Bill", "2020-09-06"),
    (null, true, "dog", "Buddy", "green", "", null, "Bill", "2020-09-06"),
    (null, true, "dog", "Bullwinkle", "orange", "", null, "Bill", "2020-09-06"),
    (null, true, "dog", "Buddy", "blue", "", null, "Bill", "2020-09-05");
select date(change_date) from Animals;
