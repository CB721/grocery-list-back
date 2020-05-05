CREATE TABLE food_names
(
    id INT NOT NULL UNIQUE AUTO_INCREMENT 
    , name VARCHAR(255)
    , PRIMARY KEY(id)
);

INSERT INTO food_names (name) VALUES
("corn"), ("rice"), ("white rice"), ("brown rice"), ("soy sauce"), ("yeast"), ("flour"), ("wheat"), ("salt"), ("pepper"), ("garlic"), ("sea salt"), ("bread"), 
("white bread"), ("whole grain bread"), ("multigrain bread"), ("cereal"), ("apples"), ("bananas"), ("oranges"), ("limes"), ("lemons"), ("grapes"), ("kiwis"), ("nutella"), ("peanut butter"), 
("butter"), ("olives"), ("olive oil"), ("canola oil"), ("vegetable oil"), ("coconut"), ("pineapple"), ("potatoes"), ("celery"), ("carrots"), ("squash"), ("zucchini"), ("cauliflower"), 
("onion"), ("green onions"), ("beans"), ("bean sprouts"), ("beets"), ("lettuce"), ("kale"), ("spinach"), ("broccoli"), ("peppers"), ("jalapeño"), ("taco shells"), ("beef"), 
("chicken breast"), ("pork"), ("chicken tenders"), ("chicken wings"), ("turkey"), ("sandwich meat"), ("cheese"), ("gouda"), ("cheddar"), ("pepper jack"), ("mozarella"), ("provolone"), ("havarti"), 
("salami"), ("pepporoni"), ("steak"), ("mac 'n cheese"), ("pasta noodles"), ("rotini"), ("penne"), ("farfalle"), ("noodles"), ("spaghetti"), ("pasta sauce"), ("vodka sauce"), ("vodka"), 
("beer"), ("wine"), ("rum"), ("tequila"), ("whiskey"), ("mushrooms"), ("cactus"), ("cantelope"), ("honeydew"), ("crushed red pepper"), ("cajun"), ("cayenne pepper"), ("wine (cooking)"), 
("oreos"), ("cookies"), ("lemonade"), ("juice"), ("cranberries"), ("strawberries"), ("cherries"), ("plums"), ("chocolate"), ("white chocolate"), ("pizza"), ("crackers"), ("saltines"), 
("soup"), ("chicken noodle soup"), ("burritos"), ("dressing"), ("jelly"), ("tonic"), ("chips"), ("chocolate chips"), ("syrup"), ("pancakes"), ("pancake mix"), ("waffles"), ("cake"), 
("cake mix"), ("frosting"), ("jello"), ("eggs"), ("cream cheese"), ("almond milk"), ("chocolate milk"), ("milk"), ("water"), ("gatorade"), ("coffee"), ("trail mix"), ("coffe creamer"), 
("baking soda"), ("orange juice"), ("apple juice"), ("giner ale"), ("ginger"), ("candy"), ("lollipops"), ("cilantro"), ("basil"), ("paprika"), ("vanilla"), ("popsicles"), ("ice cream"), 
("pear"), ("mango"), ("apricot"), ("dates"), ("nutmeg"), ("peach"), ("pie"), ("raspberries"), ("watermelon"), ("guava"), ("passion fruit"), ("argula"), ("beets"), 
("bok choy"), ("cabbage"), ("brussel sprouts"), ("mustard"), ("ketchup"), ("peas"), ("avocado"), ("cucumber"), ("pumpkin"), ("tomatoes"), ("tomatillo"), ("artichoke"), ("chick peas"), 
("lentil"), ("okra"), ("soy milk"), ("asparagus"), ("scallion"), ("salmon"), ("fish sticks"), ("turnip"), ("yams"), ("chestnuts"), ("hazelnuts"), ("peanuts"), ("almonds"), 
("walnuts"), ("pecans"), ("cashews"), ("pistachios"), ("cottage cheese"), ("eggplant"), ("pine nuts"), ("biscuits"), ("bagels"), ("muffins"), ("flat bread"), ("na'an bread"), ("curry"), 
("brownies"), ("brownie mix"), ("pastries"), ("torte"), ("feta cheese"), ("yogurt"), ("buttermilk"), ("green tea"), ("condensed milk"), ("custard"), ("eggnog"), ("gelato"), ("baby formula"), 
("whipped cream"), ("whey protein"), ("protein bars"), ("diet shakes"), ("bacon"), ("sausage"), ("doughnuts"), ("fettuccine"), ("linguine"), ("lasagna"), ("ravioli"), ("meat loaf"), ("tomato sauce"), 
("cavatappi"), ("gnocchi"), ("macaroni"), ("rotelle"), ("rotini"), ("rigatoni"), ("tortellini"), ("anchovies"), ("catfish"), ("mackerel"), ("pike"), ("lobster"), ("sea bass"), 
("bass"), ("tuna"), ("shrimp"), ("crab"), ("crayfish"), ("cuttlefish"), ("oyster"), ("octopus"), ("au jus"), ("barbeque sauce"), ("bbq sauce"), ("caramel"), ("chili"), 
("chili sauce"), ("chipotle"), ("cocktail sauce"), ("gravy"), ("hollandaise sauce"), ("honey"), ("horseradish"), ("hot sauce"), ("plantains"), ("hummus"), ("marmalade"), ("mayonnaise"), ("dijon mustard"), 
("nachos"), ("pesto sauce"), ("powdered sugar"), ("brown sugar"), ("salsa"), ("sour cream"), ("sprinkles"), ("sriracha sauce"), ("tartar sauce"), ("truffles"), ("croutons"), ("chutney"), 
("vinegar"), ("adobo"), ("miso"), ("aioli"), ("mints"), ("angel food cake"), ("pudding"), ("devil's food cake"), ("deviled eggs"), ("swiss roll"), ("collard greens"), ("black forest cake"), ("german chocolate cake"),
("tiramisu"), ("pound cake"), ("carrot cake"), ("heavy cream"), ("cupcakes"), ("red velvet cake"), ("upside down cake"), ("rum cake"), ("pizzelle cookies"), ("gingerbread"), ("molten chocolate cake"), ("bubble gum"), ("liquorice"),
("raisins"), ("jelly beans"), ("lemon drops"), ("cheesecake"), ("bear claw"), ("sherbet"), ("sorbet"), ("parfait"), ("pop tarts"), ("pretzels"), ("crème brûlée"), ("éclair"), ("strudel"),
("biscotti"), ("ramen"), ("ramen noodles"), ("chowder"), ("oatmeal"), ("papaya"), ("prunes"), ("clam"), ("capicola"), ("chorizo"), ("jerky"), ("dumplings"),
("kombucha"), ("salad"), ("stew"), ("rice vinegar"), ("sangria"), ("white wine"), ("red wine"), ("corn starch"), ("chicken broth"), ("lamb"), ("hash browns"), ("pita bread"),
("roma sauce"), ("pad thai"), ("apple sauce"), ("pie crust"), ("potato chips"), ("sweet potatoes"), ("soda"), ("swordfish"), ("crawfish"), ("energy drink"), ("cool whip"), ("hot chocolate"), ("rosemary");

CREATE PROCEDURE search_food_names(IN search VARCHAR(255))
SELECT name FROM food_names WHERE name LIKE search;
CALL search_food_names("%bread%");