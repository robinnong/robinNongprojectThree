const expenseLabels = ["rent", "groceries", "utilities", "fitness", "insurance", "restaurants"];
let totalExpenses;
let monthly = true;
let yearlyIncome;

//JQUERY SELECTORS
const $income = $('#income');
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $toggleButton = $('.viewToggle');
const $viewType = $('.viewType');
const $barChart = $('.barChart');

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
    
    const monthlyIncome = (yearlyIncome / 12).toFixed(2);
    const remainder = monthlyIncome - totalExpenses;

    $totalIncome.text(`$${monthlyIncome}`);
    $totalExpenses.text(`$${totalExpenses}`);
    $totalRemainder.text(`$${remainder}`);
    
    const percentExpense = expenseValues.map(num => ((num / monthlyIncome) * 100).toFixed(1));

    for (i=0; i < percentExpense.length; i++) {
        const html = `<p>${expenseLabels[i]}: ${percentExpense[i]}%</p>`;
        const bar = `<div class="bar"></div>`;
        $('.percentages').append(html).css("text-transform", "capitalize");
        $('.barChart').append(bar);
        $('.barChart div:last-of-type').width(percentExpense[i]*0.01*300).css("background-color", "tomato");   
    }
}   

const toggleViewType = () => {
    if(monthly === true) {
        totalExpenses = (totalExpenses * 12).toFixed(2);
        $totalIncome.text(`$${yearlyIncome.toFixed(2)}`);
        $totalExpenses.text(`$${totalExpenses}`);
        $toggleButton.addClass('move');
        $viewType.text('Yearly View');
        const remainder = (yearlyIncome - totalExpenses).toFixed(2);
        $totalRemainder.text(`$${remainder}`);
        monthly = false;
    } else {
        totalExpenses = (totalExpenses / 12).toFixed(2);
        const monthlyIncome = (yearlyIncome/12).toFixed(2);
        $totalIncome.text(`$${monthlyIncome}`);
        $totalExpenses.text(`$${totalExpenses}`);
        $toggleButton.removeClass('move');
        $viewType.text('Monthly View');
        const remainder = (monthlyIncome - totalExpenses) 
        $totalRemainder.text(`$${remainder}`);
        monthly = true;
    }
}

//INITIALIZE FUNCTION
const init = () => {
    $('form').on('submit', function(e){
        e.preventDefault(); 
        getUserInput();
    });

    $('form').on('reset', function(){
        $totalIncome.text('$0.00');
        $totalExpenses.text('$0.00');
        $totalRemainder.text('$0.00');
    });

    $toggleButton.on('click', toggleViewType);
}

//DOCUMENT READY
$(() => {
    init();
})  