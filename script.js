const legend = { 
    rent: "thistle",
    groceries: "powderblue",
    utilities: "mediumslateblue",
    fitness: "turquoise",
    insurance: "moccasin",
    restaurants: "lightcoral"
} 

const tipsArray = ["The average Canadian household spends x amount on groceries per month",
                    "Test 2",
                    "Test 3",
                    "Test 4",    
                    "Test 5",             
                    "Test 6",
                    ];

// GLOBALLY DECLARED VARIABLES
let expenseLabels = Object.keys(legend); // Array of category names
const expenseColors = Object.values(legend); // Array of colors
let monthlyExpenses; // Sum of monthly expenses
let monthly = true; // Initialize document with "Monthly View" on
let yearlyIncome; 

// CACHED JQUERY SELECTORS
const $form = $('form[name="calculator"]');
const $income = $('#income');
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $toggleButton = $('.viewToggle');
const $viewType = $('.viewType'); 
const $modal = $('.modal');
const $newLabelId = $('#newLabel');
const $percentSpend = $('.percentSpend');

// FUNCTIONS

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
const convertToString = (num) => {
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

// ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
const getUserInput = () => {
    const expenseValues = []; // Array of user's expenses

    $('.tip').removeClass('fadeInRight').empty();
    $('.percentages, .percentSpend').empty(); //resets bars and text on submit

    yearlyIncome = parseFloat($income.val()); // Gets user's net income

    // Gets value of each user input and adds it to the array of expenses
    for (i=0; i < expenseLabels.length; i++) {   
        const input = $('#' + expenseLabels[i]).val();
        const value = parseFloat(input); 
        expenseValues.push(value);
    }  

    const monthlyIncome = yearlyIncome / 12;
    monthlyExpenses = expenseValues.reduce((a, b) => a + b); // Expression that returns the sum of expenses
    const remainder = monthlyIncome - monthlyExpenses;

    // Properly formats dollar value strings
    const monthlyIncomeStr = convertToString(monthlyIncome.toFixed(2));
    const totalExpenseStr = convertToString(monthlyExpenses.toFixed(2));
    const remainderStr = convertToString(remainder.toFixed(2));
    
    // Displaying results for Sub-section 1
    $totalIncome.text(`$${monthlyIncomeStr}`);
    $totalExpenses.text(`$${totalExpenseStr}`);
    $totalRemainder.text(`$${remainderStr}`);
    $('.subSection1').find('.animated').addClass('fadeInUp delay-0.2s');  

    // Displaying results for Sub-section 2
    const percentExpense = expenseValues.map(num => ((num / monthlyIncome) * 100)); // Array of expenses as percentages
    displaySpendingSummary(monthlyExpenses, monthlyIncome, displayBars(percentExpense));
}   

const displaySpendingSummary = (val1, val2) => {
    const percent = val1 / val2; 
    const spend = percent * 100;
    const save = 100 - spend;  
    $('.percentExpenses').text(`${spend.toFixed(1)}%`); 
    $('.percentRemaining').text(`${save.toFixed(1)}%`);
    
    const div = `<div></div>`;
    const warning = `<i class="fas fa-exclamation-circle" aria-hidden="true"></i><span> Warning: Your spending exceeds income by ${percent.toFixed(1)} times</span>`;
    
    if (spend <= 100 ) { // If spending is less or equal to 100% 
        $percentSpend.append(div).find('div').width(percent * 200); // Displays % bar at x percent
        showRandomTip(); // Display a random fact/tip
    } else { // If spending exceeds 100%
        $percentSpend.append(div).find('div').width(200); // Displays % bar at full width
        $('.tip').append(warning).css("color", "tomato"); // Displays a warning message and highlights text in red
    }
}

const displayBars = (array) => { 
    for (i = 0; i < array.length; i++) {
        const percent = array[i].toFixed(1)
        const html = `<li>
                        <p>${expenseLabels[i]}: ${percent}%</p>
                        <div class="background">
                            <div class="color"></div>
                        </div>
                    </li>`;

        $('.percentages').append(html);
        $('li:last-of-type').find('.color').width(array[i] * 0.01 * 200);

        if (i < expenseColors.length) {
            const color = expenseColors[i];
            $('li:last-of-type').find('.color').css("background-color", color);
        } else {
            $('li:last-of-type').find('.color').css("background-color", "#9d92ff");
        }
    }
}

// Toggle between Monthly and Yearly view
const toggleViewType = () => {
    // Locally scoped variables
    let buttonText;
    let income;  
    let expenses;
    
    if(monthly === true) { 
        buttonText = "Yearly View"; // Changes the button text
        $toggleButton.addClass('move'); // Animates the toggle button
        monthly = false; // Yearly View

        income = yearlyIncome; // Yearly income
        expenses = monthlyExpenses * 12; // Yearly expenses
    } else { 
        buttonText = "Monthly View"; // Changes the button text
        $toggleButton.removeClass('move'); // Animates the toggle button
        monthly = true; // Monthly View
        
        income = yearlyIncome / 12; // Monthly income
        expenses = monthlyExpenses; // Monthly expenses
    }
    const remainder = income - expenses;
    // Properly formats dollar value strings
    const incomeStr = convertToString(income.toFixed(2));
    const expenseStr = convertToString(expenses.toFixed(2));
    const remainderStr = convertToString(remainder.toFixed(2));
    
    $viewType.text(buttonText); 
    $totalIncome.text(`$${incomeStr}`);
    $totalExpenses.text(`$${expenseStr}`); 
    $totalRemainder.text(`$${remainderStr}`); 
}

// FORM RESET
const resetForm = () => {
    // TOGGLE BUTTON
    monthly = true; 
    $toggleButton.removeClass('move'); 
    // RESULTS
    $('.values li').text('$0.00'); // Dollar values
    $percentSpend.empty(); // Expenses bar color
    $('.color').width(0); // Category bars color
}

// ADD A NEW SPENDING CATEGORY
const addNewLine = () => { 
    const tempLabel = "New Category";
    const html =`<div class="formLine">
                    <label for="${tempLabel}">${tempLabel}</label>
                    <div class="inputField">
                        <span>$</span>
                        <input type="number" step="0.01" id="${tempLabel}" name="${tempLabel}" required="">
                    </div>
                </div>`;

    // Prepends the html before this div
    $('.addLine').before(html); 

    // Gets input and trims whitespace around
    const newLabel = $('input[id="newLabel"]').val().trim();
    $('.expensesField div:last-of-type label').text(newLabel);

    // Assigns the new input's #id formatted in lowercase w/o whitespaces
    const inputId = newLabel.toLowerCase().replace(/\s+/g, '');
    $('.expensesField div:last-of-type label').attr('for', inputId);
    $('.expensesField').find('label[for=' + inputId + '] + div input').attr('id', inputId).attr('name', inputId); 

    // Adds this new input to the array of expenses
    expenseLabels.push(inputId);  
    $modal.hide(); // Hides the modal
}

// DISPLAYS A RANDOM FACT
const showRandomTip = () => {
    const index = Math.floor(Math.random()*tipsArray.length);
    const html = `<i class="fas fa-star" aria-hidden="true"></i>
                  <span> ${tipsArray[index]}</span>`; 
    $('.tip').append(html).addClass('fadeInRight').css("color", "#3b3b3b");
}

const hideModal = () => {
    $modal.hide(); 
}

//INITIALIZE EVENT LISTENERS
const init = () => {
    hideModal(); //HIDDEN MODAL

    //ON MAIN FORM SUBMIT
    $form.on('submit', function(e){ 
        e.preventDefault(); 
        $('.warning').empty();
        getUserInput();
    });

    //ON FORM RESET
    $form.on('reset', resetForm); 

    //ON CLICKING 'ADD LINE' BUTTON
    $('.addLine').on('click', function(){
        $modal.show();
        $newLabelId.val("");
    }); 

    // //ON CLICKING LINE TO DELETE
    // $('.expensesField > div').on('click', function () { 
    //     $(this).toggleClass('remove'); 
    // })

    // //ON CLICKING 'DELETE LINE' BUTTON
    // $('.deleteLine').on('click', function () { 
    //     $('.remove').remove();
    // //delete the labels from the DOM!
    // }); 
 
    //ON CLICKING VIEW TOGGLE BUTTON
    $toggleButton.on('click', toggleViewType);  

    //ON MODAL FORM SUBMIT
    $('form[name="modal-box"]').on('submit', function(e){ 
        e.preventDefault(); 
        addNewLine();
    });

    //ON CLICKING EXIT MODAL BUTTON
    $('.exitButton').on('click', hideModal);

    //ON CLICKING ESC KEY WHILE IN MODAL
    $(this).on('keydown', function (event) {
        if (event.key === 'Escape') {
            hideModal();
        }
    });
}

//DOCUMENT READY
$(() => {
    init();
})  