const app = {}; // NAMESPACED OBJECT

// -------------- GLOBALLY DECLARED VARIABLES --------------
app.monthly = true; // Initialize document with "Monthly View" on 

app.expenseLabels = []; // Array of user's expenses (labels)
app.expenseAttr = []; // Array of user's expenses ("for" attribute of input)
app.expenseValues = []; // Array of user's expenses (value of input)

app.expenseColors = ["thistle", "powderblue", "#f8c79e", "#5f9ea0", '#ffc0cb', "moccasin", "lightcoral", "#ffabab"];

app.tips = ["The average Canadian household is expected to spend $12,667 a year on food in 2020",
            "The average rent for a one-bedroom in Toronto is $2300",
            "A popular rule-of-thumb for deciding what percentage of income should be allocated to rent is 30%",
            "It's recommended to have at least six months of income saved in the case of an emergency",  
            ];

// -------------- CACHED JQUERY SELECTORS (STATIC) --------------
// --- Forms ---
const $form = $('form[name="calculator"]');
const $expenseFieldset = $('.expensesField');
const $modalForm = $('form[name="modalForm"]');

// --- Inputs ---
const $income = $('#income');

// --- Buttons ---
const $addButton = $('.addLine');
const $deleteButton = $('.deleteLine');
const $toggleButton = $('.viewToggle');
const $modalExitButton = $('.exitButton');  
const $barsButton = $('.barsButton');
const $chartButton = $('.chartButton');

// --- Content Sections ---
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $percentSpend = $('.percentSpend');
const $expensesSummary = $('.subSection2');
const $tipSection = $('.tip'); 
const $colorBar = $('.color');
const $canvas = $('canvas'); // Chart.js pie chart

// --- HTML Elements ---  
const $formButtons = $('.formButtons'); // Div container for add and delete buttons
const $modalBox = $('.modalDisplay');
const $viewType = $('.viewType');  
const $animatedPTag = $('.subSection1 li p:first-of-type'); 
const $newLabel = $('#newLabel');
const $subHeading = $('.subHeading');
const $percentageBars = $('.percentages') 

// -------------- FUNCTIONS --------------

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
app.convertToString = (num) => { 
    const array = num.split(""); // Array of characters in a string
    
    if (array.length === 8) { // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { // For numbers >= $100,000 and less than $1,000,000
        array.splice(3, 0, ",");
    } // Else, do nothing
    
    return array.join(""); // Returns the whole string with or w/o comma separation
}

// GETS USER'S NET YEARLY INCOME
app.getYearlyIncome = () => parseFloat($income.val()); 

// GET THE SUM OF EXPENSES
app.addExpenses = (array) => array.reduce((a, b) => a + b); 

// DISPLAYS RESULTS TO SUB SECTION 1
app.displayResult = (income, expenses) => {
    const remainder = income - expenses;
    const valuesArray = [income, expenses, remainder]; 
    
    const strArray = valuesArray.map(value => app.convertToString(value.toFixed(2)));

    $totalIncome.text(`$${strArray[0]}`);
    $totalExpenses.text(`$${strArray[1]}`);
    $totalRemainder.text(`$${strArray[2]}`);
}

// ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
app.getUserInput = () => {
    // Creates an array of all labels (DOM elements)
    const labelNodes = $('.expensesField label').toArray(); 
    const inputNodes = $('.expensesField input').toArray(); 

    // Gets the "for" attribute of each label in the array of elements
    // Gets name of each user input and adds it to the array of labels
    labelNodes.forEach((label) => {
        const name = $(label).text();
        app.expenseLabels.push(name);
        const value = $(label).attr("for");
        app.expenseAttr.push(value);
    });

    // Gets value of each user input and adds it to the array of expenses
    inputNodes.forEach((val) => {
        const input = $(val).val();
        const value = parseFloat(input);
        app.expenseValues.push(value);
    });

    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyIncome = yearlyIncome / 12;
    const monthlyExpenses = app.addExpenses(app.expenseValues); // Expression that returns the sum of expenses
    
    // Displaying results for Sub-section 1
    app.displayResult(monthlyIncome, monthlyExpenses);
    app.animateCSS($animatedPTag); 
    
    // Displaying results for Sub-section 2
    app.expensePercents = app.expenseValues.map(num => (num / monthlyIncome) * 100); // Array of expenses as percentages
    app.displaySummary(monthlyExpenses, monthlyIncome, app.displayBars());
}   

app.displaySummary = (val1, val2) => {
    const percent = val1 / val2; 
    const spend = percent * 100;
    const save = 100 - spend;  
    
    $('.percentExpenses').text(`${spend.toFixed(1)}%`); 
    $('.percentRemaining').text(`${save.toFixed(1)}%`);
    
    const div = `<div></div>`;
    const warning = `<i class="fas fa-exclamation-circle" aria-hidden="true"></i>
    <span> Warning! Your spending exceeds income by ${percent.toFixed(1)} times</span>`;
    
    // Error handling for percentages larger than 100%
    if (spend <= 100 ) { // If spending is less or equal to 100% 
        $percentSpend.append(div).find('div').width(percent * 200); // Displays % bar at x percent
        app.showRandomTip(); // Display a random fact/tip
    } else { // If spending exceeds 100%
        $percentSpend.append(div).find('div').width(200); // Displays % bar at full width
        $tipSection.append(warning).css("color", "tomato"); // Displays a warning message and highlights text in red
    }
    $expensesSummary.show();
}

app.displayBars = () => {  
    $canvas.hide();
    $percentageBars.show().empty();
    $subHeading.text('Percentage of income spent per category');

    let index = 1;

    for (i = 0; i < app.expensePercents.length; i++) {
        const percent = app.expensePercents[i].toFixed(1)
        const html = `<li>
                        <p>${app.expenseLabels[i]}: ${percent}%</p>
                        <div class="background">
                            <div class="color"></div>
                        </div>
                    </li>`;
        $percentageBars.append(html);

        let colorFill = $('.percentages li').last().find('.color');
        // Error handling for percentages larger than 100%
        app.expensePercents[i] < 100 ? colorFill.width(app.expensePercents[i] * 0.01 * 250) : colorFill.width(250);  

        i < app.expenseColors.length ? colorFill.css("background-color", app.expenseColors[i]) : colorFill.css("background-color", "#9d92ff");
    }

    app.animateCSS($subHeading);
    $chartButton.css('color', '#b3b3b3');
    $barsButton.css('color', 'grey');
}

app.displayChart = () => {
    $percentageBars.hide();
    $canvas.show();
    $subHeading.text('Percentage of expenses spent per category');
    app.animateCSS($subHeading);

    const ctx = $('#chart');
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: data = {
            datasets: [{
                data: app.expenseValues,
                backgroundColor: app.expenseColors,
            }],
            labels: app.expenseLabels,
        },
        options: { 
            responsive: true,
            aspectRatio: 1, 
            legend: {
                display: true,
                position: 'bottom',
                align: 'center',
                labels: {
                    boxWidth: 15,
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: 14,
                    fontColor: 'grey'
                }
            }
        }
    })
    $chartButton.css('color', 'grey');
    $barsButton.css('color', '#b3b3b3');
}

// TOGGLE BETWEEN MONTHLY & YEARLY VIEW
app.toggleViewType = () => {
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyExpenses = app.addExpenses(app.expenseValues);
    let buttonText;
    let income;  
    let expenses;

    if (app.monthly) { 
        $toggleButton.addClass('move'); // Animates the toggle button
        buttonText = "Yearly View"; // Changes the button text
        app.monthly = false; // Yearly View
        
        income = yearlyIncome; // Yearly income
        expenses = monthlyExpenses * 12; // Yearly expenses
    } else { 
        $toggleButton.removeClass('move'); // Animates the toggle button
        buttonText = "Monthly View"; // Changes the button text
        app.monthly = true; // Monthly View
        
        income = yearlyIncome / 12; // Monthly income
        expenses = monthlyExpenses; // Monthly expenses
    }
    
    app.displayResult(income, expenses);
    app.animateCSS($animatedPTag); 
    $viewType.text(buttonText);  
}

// FORM RESET
app.resetForm = () => {
    // TOGGLE BUTTON
    app.monthly = true; 
    $toggleButton.removeClass('move').prop("disabled", true); 
    $chartButton.prop("disabled", true); 
    // RESULTS
    $animatedPTag.text('$0.00'); // Dollar values 
    $('.percentExpenses, .percentRemaining').text('0%'); 
    $percentSpend.empty(); // Expenses bar color   
}

// ADD A NEW SPENDING CATEGORY
app.addNewLine = (e) => { 
    e.preventDefault();  
    // Gets input and trims whitespace around
    const newLabel = $newLabel.val().trim(); 
    // Assigns the new input's #id formatted in lowercase w/o whitespaces
    const inputId = newLabel.toLowerCase().replace(/\s+/g, ''); //regex for remocing whitespace
    const html =`<div class="formLine">
                    <label for="${inputId}">${newLabel}</label>
                    <div class="inputField">
                        <span>$</span>
                        <input type="number" step="0.01" id="${inputId}" name="${inputId}" required="">
                        <button type="button" aria-label="Click to delete category">
                            <i aria-hidden="true" class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;

    $formButtons.before(html); 
    app.hideModal(); // Hides modal box
}

// DISPLAYS A RANDOM FACT
app.showRandomTip = () => {
    const index = Math.floor(Math.random()*app.tips.length);
    const html = `<i class="fas fa-star" aria-hidden="true"></i>
                  <span> ${app.tips[index]}</span>`; 
            
    $tipSection.append(html).css("color", "#3b3b3b");
    app.animateCSS($tipSection);
}

// ANIMATES JQUERY SELECTOR 
app.animateCSS = (selector) => {
    selector.addClass('animated fadeInUp faster');

    const handleAnimationEnd = () => {
        selector.removeClass('animated fadeInUp faster');
        selector.off('animationend', handleAnimationEnd);
    }

    selector.on('animationend', handleAnimationEnd);
}

// HIDES MODAL BOX
app.hideModal = () => $modalBox.hide(); 

//-------------- INITIALIZED EVENT LISTENERS --------------
const init = () => {   
    $form.on('submit', function (e) { //ON MAIN FORM SUBMIT
        e.preventDefault(); 

        app.expenseLabels = [];
        app.expenseAttr = [];
        app.expenseValues = [];

        $('.percentages, .percentSpend, .tip, .warning').empty();  
        $('.formLine button').hide(); // Resolves bug when delete icons are still visible before toggling their visibility off
        $toggleButton.removeClass('move').prop("disabled", false);
        $chartButton.prop("disabled", false); 
        
        app.getUserInput();  
    });

    $form.on('reset', app.resetForm); //ON FORM RESET
    $toggleButton.on('click', app.toggleViewType); //ON CLICKING VIEW TOGGLE BUTTON 
    $modalForm.on('submit', app.addNewLine);//ON MODAL FORM SUBMIT
    $modalExitButton.on('click', app.hideModal); //ON CLICKING EXIT MODAL BUTTON
    $barsButton.on('click', app.displayBars); 
    $chartButton.on('click', app.displayChart);

    $(this).on('keydown', function (event) { //ON CLICKING ESC KEY IN MODAL
        event.key === 'Escape' ? app.hideModal() : null; //shorthand if statement
    });

    $addButton.on('click', function () { //ON CLICKING 'ADD LINE' BUTTON
        $('.formLine button').hide(); // Resolves bug when delete icons are still visible before toggling their visibility off
        $modalBox.show();
        $newLabel.val("");
    }); 

    $deleteButton.on('click', function () { //ON CLICKING 'DELETE LINE' BUTTON
        const trashButton = $('.formLine button');
        
        trashButton.toggle();
        trashButton.on('click', function(){
            let thisLine = $(this).closest('.formLine');
            // Animates the line fading out left
            thisLine.addClass('animated fadeOutLeft faster');
            // Deletes the line when animation ends
            thisLine.on('animationend', function(){
                this.remove();   
            }); 
        }) 
    }); 
}

// -------------- DOCUMENT READY --------------
$(() => {
    init();
})  