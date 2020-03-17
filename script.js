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
const $form = $('form');
const $income = $('#income');
const $totalIncome = $('.totalIncome');
const $totalExpenses = $('.totalExpenses');
const $totalRemainder = $('.totalRemainder');
const $toggleButton = $('.viewToggle');
const $viewType = $('.viewType');
const $barChart = $('.barChart');

// FUNCTIONS
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
    
    $('.percentages, .percentSpend').empty(); //resets bars and text on submit

    const div = `<div></div>`;
    const percent = (totalExpenses / monthlyIncome);
    const label = `<p>${(percent * 100).toFixed(0)}%</p>`;
    $('.percentSpend').append(div).find('div').width(percent * 400).append(label);

    for (i=0; i < percentExpense.length; i++) {
        const html = `<li>
                        <p>${expenseLabels[i]}: ${percentExpense[i]}%</p>
                        <div></div>
                    </li>`;
        const color = expenseColors[i]; 

        $('.percentages').append(html)
        $('li:last-of-type').find('div').width(percentExpense[i] * 0.01 * 400).css("background-color", color);  
    }
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
    $('.percentSpend').empty();
    $toggleButton.removeClass('move');
    monthly = true;
}

const addNewLine = () => { 
    const newLabel = "null";
    const html = `
                <div class="formLine">
                    <label for="${newLabel}">${newLabel}</label>
                    <div class="inputField">
                        <span>$</span><input type="number" step="0.01" id="${newLabel}" name="${newLabel}" required="">
                    </div>
                </div>
                `;
    $('.line').before(html);
}

//INITIALIZE EVENT LISTENERS
const init = () => {
    $form.on('submit', function(e){
        e.preventDefault(); 
        getUserInput();
    });
    $form.on('reset', resetForm);
    $('.newLine').on('click', addNewLine);
    $('.expensesField').on('click', 'label', function(){
        const input = `<input type="text" placeholder="New Category Name">`;
        $(this).html(input).css("border", "1px solid grey");  
    });
    $toggleButton.on('click', toggleViewType);
}

//DOCUMENT READY
$(() => {
    init();
})  