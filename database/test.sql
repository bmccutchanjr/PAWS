use PAWS;

-- select name, color from Animals where species="dog" order by name, color;
-- select * from Animals where add_restrict<>0;
-- insert into Animals values
    -- (null, true, "dog", "Buddy", "blue", "", null, "Bill", "2020-09-06"),
    -- (null, true, "dog", "Anatole", "blue", 20, null, "Bill", "2020-09-06"),
    -- (null, true, "dog", "Buddy", "green", "", null, "Bill", "2020-09-06"),
    -- (null, true, "dog", "Bullwinkle", "orange", "", null, "Bill", "2020-09-06"),
    -- (null, true, "dog", "Buddy", "blue", "", null, "Bill", "2020-09-05");
-- select date(change_date) from Animals;

-- show tables;
-- select * from AnimalRestrictions;
-- insert into AnimalRestrictions values
--     (17, 2),
--     (17, 3),
--     (17, 4);
-- select * from Animals left join AnimalRestriction on animaId, left join Restrictions where animalId=17;
select * from Animals a
    left join AnimalRestrictions ar on a.animalId=ar.animalId
    left join Restrictions r on ar.restrictId=r.restrictId
    where a.animalId=17;

