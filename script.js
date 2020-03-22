const app = {}; //NAMESPACED OBJECT

// GLOBALLY DECLARED VARIABLES
app.monthly = true; // Initialize document with "Monthly View" on 
app.expenseLabels = []; // Array of user's expenses (labels)
app.expenseValues = []; // Array of user's expenses (values)
app.expenseColors = ["thistle", "powderblue", "powderblue", "mediumslateblue", "turquoise", "moccasin", "lightcoral"];
app.tips = ["The average Canadian household spends x amount on groceries per month",
                    "Test 2",
                    "Test 3",
                    "Test 4",    
                    "Test 5"
                    ];

// CACHED JQUERY SELECTORS (STATIC)
// --- Forms ---
const $form = $('form[name="calculator"]');
const $expenseFieldset = $('.expensesField');
const $modalForm = $('form[name="modalBox"]');

// --- Inputs ---
const $income = $('#income');

// --- Buttons ---
const $addButton = $('.addLine');
const $deleteButton = $('.deleteLine');
const $toggleButton = $('.viewToggle');
const $modalExitButton = $('.exitButton');

// --- Content Sections ---
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $percentSpend = $('.percentSpend');
const $tipSection = $('.tip'); 
const $colorBar = $('.color');

// --- HTML Elements ---
const $modalBox = $('.modal');
const $viewType = $('.viewType');  
const $animatedPTag = $('.subSection1 li p:first-of-type');
// FUNCTIONS

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
app.convertToString = (num) => {
    const str = num.toString(); 
    const array = str.split(""); // Array of characters in a string
    
    if (array.length === 8) { 
        // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { 
        // For numbers >= $100,000 and less than $1,000,000
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
    const incomeStr = app.convertToString(income.toFixed(2));
    const expenseStr = app.convertToString(expenses.toFixed(2));
    const remainderStr = app.convertToString(remainder.toFixed(2));
    $totalIncome.text(`$${incomeStr}`);
    $totalExpenses.text(`$${expenseStr}`);
    $totalRemainder.text(`$${remainderStr}`);
}

// ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
app.getUserInput = () => {
    // Creates an array of all labels (DOM elements)
    const nodesArray = $('.expensesField label').toArray(); 

    for (i=0; i < nodesArray.length; i++) {
        const label = $(nodesArray[i]).attr("for"); // Access the "for" attribute of each label in the array of elements
        app.expenseLabels.push(label);
    }
    
    // Gets value of each user input and adds it to the array of expenses
    for (i=0; i < app.expenseLabels.length; i++) {   
        const input = $('#' + app.expenseLabels[i]).val();
        const value = parseFloat(input); 
        app.expenseValues.push(value);
    }  
    
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyIncome = yearlyIncome / 12;
    const monthlyExpenses = app.addExpenses(app.expenseValues); // Expression that returns the sum of expenses
    
    // Displaying results for Sub-section 1
    app.displayResult(monthlyIncome, monthlyExpenses);
    app.animateCSS(); 
    
    // Displaying results for Sub-section 2
    const expensePercents = app.expenseValues.map(num => ((num / monthlyIncome) * 100)); // Array of expenses as percentages
    app.displaySummary(monthlyExpenses, monthlyIncome, app.displayBars(expensePercents, app.expenseLabels));
}   

app.animateCSS = () => {
    $animatedPTag.addClass('animated fadeInUp faster');

    const handleAnimationEnd = () => {
        $animatedPTag.removeClass('animated fadeInUp faster');
        $animatedPTag.off('animationend', handleAnimationEnd);
    }

    $animatedPTag.on('animationend', handleAnimationEnd);
}

app.displaySummary = (val1, val2) => {
    const percent = val1 / val2; 
    const spend = percent * 100;
    const save = 100 - spend;  
    
    $('.percentExpenses').text(`${spend.toFixed(1)}%`); 
    $('.percentRemaining').text(`${save.toFixed(1)}%`);
    
    const div = `<div></div>`;
    const warning = `<i class="fas fa-exclamation-circle" aria-hidden="true"></i>
    <span> Warning: Your spending exceeds income by ${percent.toFixed(1)} times</span>`;
    
    if (spend <= 100 ) { // If spending is less or equal to 100% 
        $percentSpend.append(div).find('div').width(percent * 200); // Displays % bar at x percent
        app.showRandomTip(); // Display a random fact/tip
    } else { // If spending exceeds 100%
        $percentSpend.append(div).find('div').width(200); // Displays % bar at full width
        $tipSection.append(warning).css("color", "tomato"); // Displays a warning message and highlights text in red
    }
}

app.displayBars = (percentArr, labelArr) => {  
    for (i = 0; i < percentArr.length; i++) {
        const percent = percentArr[i].toFixed(1)
        const html = `<li>
                        <p>${labelArr[i]}: ${percent}%</p>
                        <div class="background">
                            <div class="color"></div>
                        </div>
                    </li>`;

        $('.percentages').append(html);
        $('li:last-of-type').find('.color').width(percentArr[i] * 0.01 * 200);
        
        if (i < app.expenseColors.length) {
            $('li:last-of-type').find('.color').css("background-color", app.expenseColors[i]);
        } else {
            $('li:last-of-type').find('.color').css("background-color", "#9d92ff");
        }
    }
}

// TOGGLE BETWEEN MONTHLY & YEARLY VIEW
app.toggleViewType = () => {
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyExpenses = app.addExpenses(app.expenseValues);
    let buttonText;
    let income;  
    let expenses;

    if(app.monthly === true) { 
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
    app.animateCSS(); 
    $viewType.text(buttonText);  
}

// FORM RESET
app.resetForm = () => {
    // TOGGLE BUTTON
    app.monthly = true; 
    $toggleButton.removeClass('move'); 
    // RESULTS
    $('.values li').text('$0.00'); // Dollar values
    $percentSpend.empty(); // Expenses bar color
    $colorBar.width(0); // Category bars color
}

// ADD A NEW SPENDING CATEGORY
app.addNewLine = (e) => { 
    e.preventDefault(); 
    const tempLabel = "New Category";
    const html =`<div class="formLine">
                    <label for="${tempLabel}">${tempLabel}</label>
                    <div class="inputField">
                        <span>$</span>
                        <input type="number" step="0.01" id="${tempLabel}" name="${tempLabel}" required="">
                        <button type="button" aria-label="Click to delete category">
                            <i aria-hidden="true"></i>
                        </button>
                    </div>
                </div>`;
                
    // Prepends the html before this div
    $addButton.before(html); 

    // Gets input and trims whitespace around
    const newLabel = $('input[id="newLabel"]').val().trim();
    $('.expensesField div:last-of-type label').text(newLabel);

    // Assigns the new input's #id formatted in lowercase w/o whitespaces
    const inputId = newLabel.toLowerCase().replace(/\s+/g, '');
    $('.expensesField div:last-of-type label').attr('for', inputId);
    $expenseFieldset.find('label[for=' + inputId + '] + div input').attr('id', inputId).attr('name', inputId); 

    // Adds this new input to the array of expenses
    app.expenseLabels.push(inputId);  
    app.hideModal(); // Hides the modal
}

// DISPLAYS A RANDOM FACT
app.showRandomTip = () => {
    const index = Math.floor(Math.random()*app.tips.length);
    const html = `<i class="fas fa-star" aria-hidden="true"></i>
                  <span> ${app.tips[index]}</span>`; 
    $tipSection.append(html).addClass('fadeInRight').css("color", "#3b3b3b");
}

// HIDES MODAL BOX
app.hideModal = () => {
    $modalBox.hide(); 
}

//INITIALIZE EVENT LISTENERS
const init = () => {
    app.hideModal(); //HIDDEN MODAL
    $('.formLine i').hide();

    $form.on('submit', function (e) { //ON MAIN FORM SUBMIT
        e.preventDefault(); 
        app.expenseLabels = [];
        app.expenseValues = [];
        $('.percentages, .percentSpend, .tip, .warning').empty();  
        $tipSection.removeClass('fadeInRight');
        $toggleButton.removeClass('move');
        app.getUserInput();
    });

    $form.on('reset', app.resetForm); //ON FORM RESET
    $toggleButton.on('click', app.toggleViewType); //ON CLICKING VIEW TOGGLE BUTTON 
    $modalForm.on('submit', app.addNewLine);//ON MODAL FORM SUBMIT
    $modalExitButton.on('click', app.hideModal); //ON CLICKING EXIT MODAL BUTTON

    $(this).on('keydown', function (event) { //ON CLICKING ESC KEY IN MODAL
        if (event.key === 'Escape') {
            hideModal();
        }
    });

    $addButton.on('click', function () { //ON CLICKING 'ADD LINE' BUTTON
        $modalBox.show();
        $('#newLabel').val("");
    }); 

    $deleteButton.on('click', function () { //ON CLICKING 'DELETE LINE' BUTTON
        $('.formLine i').toggle();
    }); 

    $('.formLine button').on('click', function(){
        // Animates the line fading out left
        $(this).parent().parent().addClass('animated fadeOutLeft faster');
        
        // Deletes the line when animation ends
        $(this).parent().parent().on('animationend', function(){
            this.remove(); 
        }); 
    }) 
}

//DOCUMENT READY
$(() => {
    init();
})  