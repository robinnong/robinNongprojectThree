const legend = { 
    rent: "thistle",
    groceries: "powderblue",
    utilities: "mediumslateblue",
    fitness: "turquoise",
    insurance: "moccasin",
    restaurants: "lightcoral"
}

const expenseLabels = Object.keys(legend)  
const expenseColors = Object.values(legend)  
let totalExpenses;
let monthly = true;
let yearlyIncome;

//JQUERY SELECTORS
const $form = $('form');
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
    
    const monthlyIncome = calculateMonthlyIncome(yearlyIncome);
    const remainder = (monthlyIncome - totalExpenses).toFixed(2);
 
    $totalIncome.text(`$${monthlyIncome}`);
    $totalExpenses.text(`$${totalExpenses}`);
    $totalRemainder.text(`$${remainder}`);
    
    const percentExpense = expenseValues.map(num => ((num / monthlyIncome) * 100).toFixed(1));

    $('.percentages, .barChart, .percentSpend').empty(); //resets bars and text on submit
    for (i=0; i < percentExpense.length; i++) {
        const html = `<p>${expenseLabels[i]}: ${percentExpense[i]}%</p>`;
        const div = `<div></div>`;
        const color = expenseColors[i]; 
        $('.percentages').append(html).css("text-transform", "capitalize");
        $('.barChart').append(div).find('div:last-of-type').width(percentExpense[i] * 0.01 * 300).css("background-color", color);  
    }

    const div = `<div></div>`;
    $('.percentSpend').append(div).find('div').width((totalExpenses/monthlyIncome)*300);
}   

const calculateMonthlyIncome = (num) => {
    return (num / 12).toFixed(2);
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
        const monthlyIncome = calculateMonthlyIncome(yearlyIncome);
        $totalIncome.text(`$${monthlyIncome}`);
        $totalExpenses.text(`$${totalExpenses}`);
        $toggleButton.removeClass('move');
        $viewType.text('Monthly View');
        const remainder = (monthlyIncome - totalExpenses).toFixed(2);
        $totalRemainder.text(`$${remainder}`);
        monthly = true;
    }
}

const resetForm = () => {
    $('.values li').text('$0.00'); 
    $('.barChart, .percentSpend').empty();
    $toggleButton.removeClass('move');
    monthly = true;
}

//INITIALIZE FUNCTION
const init = () => {
    $form.on('submit', function(e){
        e.preventDefault(); 
        getUserInput();
    });
    $form.on('reset', resetForm);
    $toggleButton.on('click', toggleViewType);
}

//DOCUMENT READY
$(() => {
    init();
})  