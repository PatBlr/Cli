# Cli
Object oriented approach of a dynamic CLI-Library without the use of any additional npm packages except for buildin packages.

Create a new CLI:
```typescript
const cli = new Cli();
```

Write
-
Writes a given string to the console. The textcolor can be passed as an optional parameter.

<details>
  <summary>Supported textcolors</summary>
  
  - Black
  - Blue
  - Green
  - Grey
  - Magenta
  - Red
  - White
  - Yellow
  - Reset ( Resets to the default CLI-Color ) 
</details>

Note that the textcolor as a parameter is case-insensitive.

```typescript
cli.write("This is a colored text! ", "cyan");
cli.writeln("(This one ends with a newline!)", "yellow");
cli.write("See?");
```
![grafik](https://user-images.githubusercontent.com/77332531/190852833-dee999bd-800e-43d3-8e62-8290855e5456.png)


Select
-
Allows a user to select options of a given array of tuples.\
Arrow keys are used for the navigation, spacebar to select / deselect and return to submit.\

Tuples first entry is the option as a string and the second entry is a boolean whether the option is pre-selected.\
Returns the altered array of tuples, where the selected options are marked with true and the unselected ones with false.

```typescript
cli.write("What kind of fruits do you like? ");
cli.writeln("(Everyone likes apples)", "grey");

let selected = await cli.select([
    ["Apple", true],
    ["Banana", false],
    ["Orange", false],
    ["Strawberry", false],
    ["Raspberry", false],
  ]);
```
![Animation](https://user-images.githubusercontent.com/77332531/190853488-95e50f7a-a26a-476c-8a22-ba96ec1f40fb.gif)
Returns
```typescript
[
  [ 'Apple', true ],
  [ 'Banana', true ],
  [ 'Orange', false ],
  [ 'Strawberry', true ],
  [ 'Raspberry', false ]
]
```
