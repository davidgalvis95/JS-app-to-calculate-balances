
//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum =0;
        data.allItems[type].forEach(function(current){

            sum = sum + current.value;

        })

        data.total[type]=sum;

    };

    var data={
        allItems:{
            exp: [],
            inc: []
        },
        
        total:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        //-1 means that this does not exist
        percentage: -1,
        
    }
    return{
        addItem: function(type,des,val){
            var newItem, ID;

            //create the new id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID=0;
            }

            //create the new type of object with the function constructor
            if (type ==='exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            //Store the new item in the array
            data.allItems[type].push(newItem);
            //Return the object
            return newItem;
        },
        //reharse and study how this is working now, specially the fact of the ids
        deleteItem: function(type,id){

            ids = data.allItems[type].map(function(){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }


        },

        calculateBudget: function(){
            //Calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget: income - expenses
            data.budget = data.total.inc - data.total.exp;

            //calculate the % of income that we've spent
            if(data.total.inc>0){
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else{
                data.percentage= -1;
            }
            

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.total.inc);
            });
        },

        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc:data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    };

})();
//UI CONTROLLER
var UIController  = (function () {

    var DOMstrings={
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue:'.add__value',
        addButton: '.add__btn',
        incomeContainer: 'income__list',
        expensesContainer: 'expenses__container',
        budgetLabel: '.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel:'.item__percentage'
        dateLabel:'.budget__title--month'

    }

    var fotmatNumber = function(num, type) {
        /*
            + or - signs before the number
            exactly 2 decimal points
            comma separating the thousands
            2310.4555 -> + 2,310.46
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.')

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length)
        };

        dec = numSplit[1];
        return (type === 'exp' ? '+' : '-') + ' ' + int + '.' + dec;
    };

    return{
        getInput: function(){

            return {
            type:document.querySelector(DOMstrings.inputType).value,//Will be either inc or exp
            description:document.querySelector(DOMstrings.inputDescription).value,
            value:parseFloat(document.querySelector(DOMstrings.inputValue).value)

            };

        },

        addListItem: function(obj,type){
            var html, newHtml,element;
            //Create s html string with placeholder text
            if(type = 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> < div class="item__description" >%description%</div > <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div >'

            } else if (type = 'exp'){

                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> < div class="item__description" >%description%</div > <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div >'
            }
            //Replace the placeholder text with come actual data

            newHtml=html.replace('%id%',obj.id);
            newHtml=html.replace('%description%',obj.description);
            newHtml=html.replace('%value%',formatNumber(obj.value,type));

            //Insert the html into the DOM

            document.querySelector(element).insertAdjacentElement('beforeend',newHtml);            

        },

        deleteListItem: function(selectorId){

            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);

        },

        clearFields: function(){
            var fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', '+DOMstrings.inputValue);
            //querySelectorAll does not return an array but a list, so we need to convert the list into an array
            //The slice method allow us to convert a list into a array
            //This method is stored in the Array.prototype

            fieldsArr = Array.prototype.slice.call(fields);
            //This for each block makes that the current element in the array gets clear without content
            fieldsArr.array.forEach(function(current,index,array){
                //This content is back to empty in the description and value fields of the app
                current.value="";
                
            });
            //The focus gets back into the fieldsArr[0], which is the same than the description
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            obj.budget >=0? type ='inc' : type ='exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '-';
            }
        },

        displayPercentages: function(percentages){
            //This will return a nodelist, because each element inside a div or a section in an html is called a node
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            var nodeListForEach = function(list,callback){
                for (var i = 0; i<list.length;i++){
                    callback(list[i],i);
                }
            };

            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent= '-'
                }                
            });
        },

        displayMonth: function(){
            var year,month,months,now;
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = months[now.getMonth()];
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' +year;

        },

        getDOMStrings: function () {
            return DOMstrings;
        }
    }
    
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl,UICtrl) {
    // var z = budgetCtrl.publicTest(5);
    // return{
    //     anotherPublic:function(){
    //         console.log(z);
    //     }
    // }
    var setUpEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();

            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    };



    var updateBudget = function(){
        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        //2.Return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget in the UI
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };

    var updatePercentages = function(){

        //1.Calculate the percentages
        budgetCtrl.calculatePercentages();
        //2. Read the percentages from the Budget controller
        var percentages = budgetCtrl.getPercentage();
        //3. Update the UI with the new percentages
        //console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };


    var ctrlAddItem = function(){

        var input,newItem;
        //1.Get the field input data
        input=UICtrl.getInput();
        //console.log(input);
        if(input.description!=="" && !isNaN(input.value) && input.value > 0){
        //2.Add te item to the budget controller
        newItem = budgetCtrl.addItem(input.type,input.description,input.value);
        //3.Add the item to the UI
        UICtrl.addListItem(newItem,input.type);
        //4.Delete the already filled fields (description and value)
        UICtrl.clearFields();

        //5.Calculate the budget and update it
        updateBudget();
        //console.log('it works')

        //6.Calculate and update the percentages
        updatePercentages();
        }

    };

    var ctrlDeleteItem = function (event) {

        var itemId,splitID,type,ID;
        //We need to do DOM traversing
        //console.log(event.target);
        //console.log(event.parentNode.parentNode.parentNode.parentNode.id);
        itemId = event.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId){
            //This split returns an array spllited with the respective elements separated by the dashes
            splitID = itemId.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            //2. delete from the UI
            UICtrl.deleteListItem(itemId);

            //3.Update and show the new budget
            updateBudget();
            //4.Calculate and update the percentages
            updatePercentages();
        }


    }
    return{
        init:function(){
            console.log('start');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    }
    
})(budgetController,UIController);

//Without the calling of this function nothing's gonna work
controller.init();

// How to clear html fields, how to use the queryselectorAll, convert a list into an array and better way to loop over an array than for loops: foreach.

///Event bubbling: the event is first fired on the button, but it will be fired in all the parent elements
//Event delegation: We set an event in the parent element, and from ther we set a target through the target property where we will execute the event and we will catch it also from there.
//We add the event to the parent element and then we choose on which child element we are interested in to apply the event element, it's also used when we want an event handler attached to an alement that is not yet in the DOM when our page is loaded