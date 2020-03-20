const legend = { 
    rent: "thistle",
    groceries: "powderblue",
    utilities: "mediumslateblue",
    fitness: "turquoise",
    insurance: "moccasin",
    restaurants: "lightcoral"
}

//can use toLowercase function!!
const expenseLabels = Object.keys(legend)  
const expenseColors = Object.values(legend)  
let totalExpenses;
let monthly = true;
let yearlyIncome; 

//JQUERY SELECTORS
const $form = $('form[name="calculator"]');
const $income = $('#income');
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $toggleButton = $('.viewToggle');
const $viewType = $('.viewType');
const $barChart = $('.barChart');
const $modal = $('.modal');
const $newLabelID = $('#newLabel');
const $percentSpend = $('.percentSpend');

// FUNCTIONS

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
const convertNumToString = (num) => {
    const str = num.toString();
    const array = str.split("");

    if (array.length === 8) { // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { // For numbers >= $100,000 and less than $1,000,000
        array.splice(3, 0, ",");

    }
    return array.join(""); 
}

// ON FORM SUBMISSION, GET USER INPUT VALUES AND DISPLAY RESULT
const getUserInput = () => {
    yearlyIncome = parseInt($income.val()); 
    //OBJECT OF USER INPUTS 
    const expenseValues = [];
    for (i=0; i < expenseLabels.length; i++) {   
        const input = $('#' + expenseLabels[i]).val();
        const value = parseInt(input);
        expenseValues.push(value);
    } 
    totalExpenses = expenseValues.reduce((a, b) => a + b).toFixed(2); 
    
    const monthlyIncome = calculateMonthlyIncome(yearlyIncome);
    const remainder = (monthlyIncome - totalExpenses).toFixed(2);
    
    const monthlyIncomeStr = convertNumToString(monthlyIncome);
    const totalExpenseStr = convertNumToString(totalExpenses);
    const remainderStr = convertNumToString(remainder);
    
    $totalIncome.text(`$${monthlyIncomeStr}`);
    $totalExpenses.text(`$${totalExpenseStr}`);
    $totalRemainder.text(`$${remainderStr}`);
    $('.subSection1').find('.animated').addClass('fadeInUp delay-0.2s');  

    const percentExpense = expenseValues.map(num => ((num / monthlyIncome) * 100).toFixed(1));
    
    $('.percentages, .percentSpend').empty(); //resets bars and text on submit

    const div = `<div></div>`;
    const percent = (totalExpenses / monthlyIncome);
    const spend = (percent * 100).toFixed(0);
    const save = 100 - spend;

    if (percent <= 1 ) {
        $percentSpend.append(div).find('div').width(percent * 200);
    } else {
        $('.warning').html(`<i class="fas fa-exclamation-circle"></i><span> Warning: Your spending exceeds income by x times</span>`);
        $percentSpend.append(div).find('div').width(1 * 200);
    }
    $('.percentExpenses').text(`${spend}%`); 
    $('.percentRemaining').text(`${save}%`);

    for (i=0; i < percentExpense.length; i++) {
        const html = `<li>
                        <p>${expenseLabels[i]}: ${percentExpense[i]}%</p>
                        <div class="background">
                            <div class="color"></div>
                        </div>
                    </li>`;
        const color = expenseColors[i]; 

        $('.percentages').append(html)
        $('li:last-of-type').find('div.color').width(percentExpense[i] * 0.01 * 200).css("background-color", color) 
    }
}   

const calculateMonthlyIncome = (num) => {
    return (num / 12).toFixed(2);
}

const toggleViewType = () => {
    if(monthly === true) {

        $viewType.text('Yearly View');
        $toggleButton.addClass('move');
        monthly = false;

        const income = yearlyIncome.toFixed(2)
        const incomeStr = convertNumToString(income); 
        $totalIncome.text(`$${incomeStr}`);
        
        totalExpenses = (totalExpenses * 12).toFixed(2);
        const totalExpenseStr = convertNumToString(totalExpenses);
        $totalExpenses.text(`$${totalExpenseStr}`); 

        const remainder = (yearlyIncome - totalExpenses).toFixed(2);
        const remainderStr = convertNumToString(remainder);
        $totalRemainder.text(`$${remainderStr}`);

    } else {
        
        $toggleButton.removeClass('move');
        $viewType.text('Monthly View');
        monthly = true;
        
        const monthlyIncome = calculateMonthlyIncome(yearlyIncome);
        totalExpenses = (totalExpenses / 12).toFixed(2);
        const remainder = (monthlyIncome - totalExpenses).toFixed(2);

        const monthlyIncomeStr = convertNumToString(monthlyIncome);
        const totalExpenseStr = convertNumToString(totalExpenses);
        const remainderStr = convertNumToString(remainder);
        
        $totalIncome.text(`$${monthlyIncomeStr}`);
        $totalExpenses.text(`$${totalExpenseStr}`); 
        $totalRemainder.text(`$${remainderStr}`);

    }
}

const resetForm = () => {
    $('.values li').text('$0.00'); 
    $percentSpend.empty();
    $toggleButton.removeClass('move');
    monthly = true;
}

const addNewLine = () => { 
    const newLabel = "New Category";
    const html = `
    <div class="formLine">
                    <label for="${newLabel}">${newLabel}</label>
                    <div class="inputField">
                        <span>$</span><input type="number" step="0.01" id="${newLabel}" name="${newLabel}" required="">
                        </div>
                </div>
                `;
    $('.newLine').before(html);
    const label = $('input[id="newLabel"]').val()
    $('.expensesField div:last-of-type label').text(label)
    //ASSIGNS THE NEW INPUT ID 
    $('.expensesField div:last-of-type input').attr('id', label); 
    $modal.hide();
}

//INITIALIZE EVENT LISTENERS
const init = () => {
    $modal.hide(); //HIDDEN MODAL
    
    $form.on('submit', function(e){ //ON FORM SUBMIT
        e.preventDefault(); 
        $('.warning').empty();
        getUserInput();
    });
    
    $form.on('reset', resetForm); //ON FORM RESET
    
    $('.newLine').on('click', function(){
        $modal.show();
        $newLabelID.val("")
    }); //ON CLICKING ADD NEW LINE
    
    $('.expensesField').on('click', 'label', function(){ //TEST FUNCTION
        $(this).css("color", "red");  
    });

    $toggleButton.on('click', toggleViewType); //ON CLICKING TOGGLE VIEW 
    
    $('form[name="modal-box"]').on('submit', function(e){ //ON SUBMITTING MODAL
        e.preventDefault(); 
        addNewLine();
    })

    $('.exitButton').on('click', function(){  
        $modal.hide(); 
    })

    $(this).on('keydown', function (event) {
        if (event.key === 'Escape') {
            $modal.hide();
        }
    })
}

//DOCUMENT READY
$(() => {
    init();
})  