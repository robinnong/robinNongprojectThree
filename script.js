const app = {}; // NAMESPACE OBJECT

app.monthly = true; // Initialize document with "Monthly View" on 
app.barChartWidth = 200; //width in pixels 

// -------------- CACHED JQUERY SELECTORS (STATIC) --------------//
// --- Forms & Inputs---
app.$form = $('form[name="calculator"]'); 
app.$modalForm = $('form[name="modalForm"]'); 
app.$income = $('#income');

// --- Buttons ---  
app.$toggleButton = $('.viewToggle'); 
app.$barsButton = $('.barsButton');
app.$chartButton = $('.chartButton');

// --- Content Sections ---  
app.$percentSpend = $('.percentSpend div'); 
app.$canvas = $('canvas'); // Chart.js pie chart

// --- HTML Elements ---  
app.$modalBox = $('.modalOuter');
app.$viewType = $('.viewType');  
app.$animatedPTag = $('.subSection1 li p:first-of-type'); 
app.$newLabel = $('#newLabel');
app.$subHeading = $('.subHeading');
app.$percentageBars = $('.barChartContainer'); 

// -------------- FUNCTIONS --------------// 

// GET A RANDOM PASTEL COLOR
app.getRandomColor = () => {
    const hue = (Math.floor(Math.random() * 30)) * 12; // Provides Math.random with a range of 30 different hues
    const randomColor = `hsl(${hue}, 50%, 80%)`;
    return randomColor;
}

// GENERATE AN ARRAY OF RANDOM PASTEL COLOURS
app.getColorArray = () => {
    app.colorArray = []; 

    for (let i = 0; i < app.expenseValues.length; i++) {
        const newColorIndex = app.getRandomColor(); 

        if (app.colorArray.includes(newColorIndex)) { 
            i = i - 1; // if this color already exists, add one more cycle to the loop
        } else {
            app.colorArray.push(newColorIndex); // else if this color does not already exist, add it to the array
        }
    }
    return app.colorArray;
}

// CONVERT NUMBER TO FORMATTED STRING WITH COMMA SEPARATION
app.convertToString = (num) => { 
    const array = [...num]; // Array of characters in a string using a spread operator
    
    if (array.length === 8) { // For numbers >= $10,000 and less than $100,000
        array.splice(2, 0, ",");
    } else if (array.length === 9) { // For numbers >= $100,000 and less than $1,000,000
        array.splice(3, 0, ",");
    } 
    
    return array.join(""); // Returns the whole string with or w/o comma separation
}

// GETS USER'S NET YEARLY INCOME
app.getYearlyIncome = () => parseFloat(app.$income.val()); 

// GET SUM OF EXPENSES
app.addExpenses = (array) => array.reduce((a, b) => a + b); 

// DISPLAYS RESULTS TO SUB SECTION 1
app.displayResult = (income, expenses) => {
    const remainder = income - expenses;
    const valuesArray = [income, expenses, remainder]; 

    const strArray = valuesArray.map(value => app.convertToString(value.toFixed(2)));

    $('.totalIncome').text(`$${strArray[0]}`);
    $('.totalExpenses').text(`$${strArray[1]}`);
    $('.totalRemainder').text(`$${strArray[2]}`);

    app.animateCSS(app.$animatedPTag); 
}

// ON FORM SUBMISSION, GET USER INPUT AND DISPLAY RESULT
app.getUserInput = () => {

    app.expenseLabels = []; // Array of user's expenses (labels)
    app.expenseAttr = []; // Array of user's expenses ("for" attribute of input)
    app.expenseValues = []; // Array of user's expenses (value of input)  

    // Creates an array of all labels (DOM elements)
    const labelNodes = $('.expensesField label').toArray(); 
    const inputNodes = $('.expensesField input').toArray(); 

    // Gets the "for" attribute of each label in the array of elements
    // Gets name of each user input and adds it to the array of labels
    labelNodes.forEach(label => {
        const name = $(label).text();
        app.expenseLabels.push(name);
        const value = $(label).attr("for");
        app.expenseAttr.push(value);
    });

    // Gets value of each user input and adds it to the array of expenses
    inputNodes.forEach(val => {
        const input = $(val).val();
        const value = parseFloat(input);
        app.expenseValues.push(value);
    });
    
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyIncome = yearlyIncome / 12;
    const monthlyExpenses = app.addExpenses(app.expenseValues); // Expression that returns the sum of expenses
    
    // Displaying results for Sub-section 1
    app.displayResult(monthlyIncome, monthlyExpenses);
    app.displaySubsection1(monthlyExpenses, monthlyIncome);
    
    // Displaying results for Sub-section 2
    app.getColorArray(); // Create an array of random colours
    app.expensePercents = app.expenseValues.map(num => (num / monthlyIncome) * 100); // Array of expenses as percentages
    
    app.displaySubsection2(true);
}   

app.displaySubsection1 = (val1, val2) => { 
    const percent = val1 / val2; 
    const spend = percent * 100;
    const save = 100 - spend;  
    
    $('.percentExpenses').text(`${spend.toFixed(1)}%`); 
    $('.percentRemaining').text(`${save.toFixed(1)}%`);
    
    const warning = `<i class="fas fa-exclamation-circle" aria-hidden="true"></i>
    <span> Warning! Your spending exceeds income by ${percent.toFixed(1)} times</span>`;
    
    // Error handling for percentages larger than 100%
    if (spend <= 100) { 
        // If spending is less or equal to 100%, display % bar at x percent
        app.$percentSpend.width(percent * app.barChartWidth); 
    } else { 
        // If spending exceeds 100%, display bar at full width w/warning message
        app.$percentSpend.width(app.barChartWidth); 
        $('.warning').append(warning); 
    }
    $('.subSection2').show();
}

// DISPLAY EXPENSE SUMMARY
app.displaySubsection2 = (param) => {
    let str;
    if (param) {
        str = "total income";
        app.$percentageBars.show();
        app.$canvas.hide();
        app.$barsButton.addClass('active');
        app.$chartButton.removeClass('active');
        
        app.displayBars();
    } else {
        str = "total expenses";
        app.$percentageBars.hide();
        app.$canvas.show();
        app.$chartButton.addClass('active');
        app.$barsButton.removeClass('active');
        
        app.displayChart()
    }
    app.$subHeading.html(`<p>Percentage of <span>${str}</span> spent per category</p>`); 
    app.animateCSS(app.$subHeading);
}

// GENERATE BAR CHART
app.displayBars = () => {  
    app.$percentageBars.empty();

    const arrLength = app.expensePercents.length;

    for (let i = 0; i < arrLength; i++) { 
        const percent = app.expensePercents[i].toFixed(1);
        const html = `<li>
                        <p>${app.expenseLabels[i]}: <span>${percent}%</span></p>
                        <div class="background">
                            <div class="color"></div>
                        </div>
                    </li>`;
        app.$percentageBars.append(html);

        const colorFill = $('.color').last();

        // Error handling for percentages larger than 100%
        arrLength < 100 ? colorFill.width(percent * 0.01 * app.barChartWidth) : colorFill.width(app.barChartWidth);  
        colorFill.css("background-color", app.colorArray[i]);  
    };
}

// GENERATE PIE CHART
app.displayChart = () => {
    const ctx = $('#chart');
    const pieChart = new Chart(ctx, {
        type: 'pie',
        data: data = {
            datasets: [{
                data: app.expenseValues,
                backgroundColor: app.colorArray,
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
}

// TOGGLE BETWEEN MONTHLY & YEARLY VIEW
app.toggleViewType = () => {
    const yearlyIncome = app.getYearlyIncome(); // Gets user's net income
    const monthlyExpenses = app.addExpenses(app.expenseValues);
    let income;  
    let expenses;

    if (app.monthly) { 
        app.$toggleButton.addClass('move'); // Animates the toggle button
        app.$viewType.text("Yearly View"); // Changes the button text
        app.monthly = false; // Yearly View
        
        income = yearlyIncome; // Yearly income
        expenses = monthlyExpenses * 12; // Yearly expenses
    } else { 
        app.$toggleButton.removeClass('move'); // Animates the toggle button
        app.$viewType.text("Monthly View"); // Changes the button text
        app.monthly = true; // Monthly View
        
        income = yearlyIncome / 12; // Monthly income
        expenses = monthlyExpenses; // Monthly expenses
    }

    app.displayResult(income, expenses);
}

// ADD A NEW SPENDING CATEGORY
app.addNewLine = () => { 
    const newLabel = app.$newLabel.val().trim(); // Gets input and trims whitespace around
    const inputId = newLabel.toLowerCase().replace(/\s+/g, ''); // Assigns the new input's #id in lowercase w/o whitespaces using regex
    const html =
    `<li class="formLine">
        <label for="${inputId}">${newLabel}</label>
        <div class="inputField">
            <span>$</span>
            <input type="number" step="0.01" id="${inputId}" name="${inputId}" min="0" max="10000" required>
            <button type="button" aria-label="Click to delete category">
                <i aria-hidden="true" class="fas fa-trash"></i>
            </button>
        </div>
    </li>`;

    $('.formButtons').before(html);  
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

// HIDES TRASH ICONS
app.toggleOffDelete = () => $('.formLine button').hide();

// DISABLES TOGGLE BUTTON
app.disableButton = (boolean) => {
    $('.viewToggle, .chartButton').prop("disabled", boolean);   
}

// RESET TOGGLE BUTTON 
app.resetToggle = () => {
    app.$viewType.text("Monthly View"); // Changes the button text
    app.$toggleButton.removeClass('move'); 
    app.monthly = true; // Resets view type 
}

// HIDES MODAL BOX
app.hideModal = () => app.$modalBox.removeClass('visible');

//-------------- INITIALIZE EVENT LISTENERS --------------//
app.init = () => {    
    //ON MAIN FORM SUBMIT
    app.$form.on('submit', function (e) { 
        e.preventDefault(); 
        $('.percentages, .warning').empty();  

        app.disableButton(false);
        app.resetToggle(); // Resets toggle button position
        app.toggleOffDelete(); 
        app.getUserInput(); 
    }); 
    
    //ON MAIN FORM RESET
    app.$form.on('reset', function() {
        $('.percentExpenses, .percentRemaining, .barChartContainer span').text('0%');  
        $('.color, .percentSpend div').width(0); // Resets bars to 0 percent 
        app.$animatedPTag.text('$0.00'); // Dollar values  

        app.disableButton(true); 
        app.resetToggle(); // Resets toggle button position
    }); 

    //ON CLICKING VIEW TOGGLE BUTTON 
    app.$toggleButton.on('click', app.toggleViewType); 

    //ON MODAL FORM SUBMIT
    app.$modalForm.on('submit', function(e) {
        e.preventDefault();  
        app.addNewLine();
        app.hideModal();
    });

    //ON CLICKING EXIT MODAL BUTTON
    $('.exitButton').on('click', app.hideModal); 

    //ON CLICKING OUTSIDE MODAL BOX
    app.$modalBox.on('click', function(e){
        e.target.closest('form') === null ? $(this).removeClass('visible'): null; //Hide modal box if click event on box is not registered
    });

    // ON PRESSING THE ESC KEY WHILE IN MODAL - $(this) is the window
    $(this).on('keydown', function (e) { 
        e.key === 'Escape' ? app.hideModal() : null; //shorthand conditional statement
    }); 

    // ON CLICKING BAR CHART BUTTON
    app.$barsButton.on('click', function() {  
        app.displaySubsection2(true)
    });

    // ON CLICKING PIE CHART BUTTON
    app.$chartButton.on('click', function() {   
        app.displaySubsection2(false)
    }); 

    //ON CLICKING 'ADD LINE' BUTTON
    $('.addLine').on('click', function () { 
        app.toggleOffDelete();
        app.$modalBox.addClass('visible')
        app.$newLabel.val(""); 
    }); 

    //ON CLICKING 'DELETE LINE' BUTTON
    $('.deleteLine').on('click', function () { 
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
        }); 
    }); 
}

// -------------- DOCUMENT READY --------------//
$(() => {
    app.init(); //INITIALIZE
})  