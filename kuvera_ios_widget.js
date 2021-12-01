// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
//Developed by Sapnesh Naik <sapnesh@kerneldev.com>

//add your Kuvera login email here
const kuveraEmail = "<email>"

//add your kuvera password here
const kuveraPassword = "<password>"

//The default setting has colored arrows enabled (green for good and red for bad). You can disable this by setting the colorArrows variabke, to false.
const colorArrows = true


//useTransparency is to indicate whether or not to use the no-background module
const useTransparency = false

//numColor is the color of the numbers in the widget
let numColor = new Color(Color.black().hex)

let listwidget = new ListWidget();

let widget = await setupWidget();

// Check where the script is running
if (config.runsInWidget) {
    // Runs inside a widget so add it to the homescreen widget
    Script.setWidget(widget);
} else {
    // Show the medium widget inside the app
    widget.presentSmall();
}
Script.complete();


/*
@@@@@@@@@@@@@@@@@@@@@@@@@@

Start functions

@@@@@@@@@@@@@@@@@@@@@@@@@@
*/

async function setupWidget() {

    // Fetch details from Kuvera API
    let kuveraReturns = await getKuveraReturns();


    const kuveraHeading = listwidget.addText("Kuvera")
    kuveraHeading.font = Font.systemFont(15)
    kuveraHeading.textColor = Color.white()
    kuveraHeading.centerAlignText()

    listwidget.addSpacer(4)

    //add items to the widget
    addItem("Total", kuveraReturns.current_value)
    addItem("Today", kuveraReturns.mutual_funds.one_day_change)
    addItem('Current', kuveraReturns.mutual_funds.current_value)
    addItem('Invested', kuveraReturns.mutual_funds.total_invested)
    addItem('EPF', kuveraReturns.epf.current_value)
    addItem('SaveSmart', kuveraReturns.save_smarts.current_value)

    listwidget.setPadding(7, 14, 14, 14)

    if (useTransparency) {
        const RESET_BACKGROUND = !config.runsInWidget
        const { transparent } = importModule('no-background')
        listwidget.backgroundImage = await transparent(Script.name(), RESET_BACKGROUND)
    } else {
        listwidget.backgroundColor = new Color("#212121")
    }

    // Return the created widget
    return listwidget;
}

async function getKuveraReturns() {
    // Fetch Access Token
    let url = "https://api.kuvera.in/api/v3/users/authenticate.json";

    const body = {
        "email": kuveraEmail,
        "password": kuveraPassword,
        "v": "1.179.14"
    };

    let request = new Request(url);
    request.method = "POST";
    request.headers = { "Content-Type": "application/json" };
    request.body = JSON.stringify(body);

    let response = await request.loadJSON();
    // log(response)
    const token = response.token;

    // Fetch Portfolio ID
    url = "https://api.kuvera.in/api/v3/user/info.json?v=1.186.9&app_version=OLD";
    request = new Request(url);
    request.headers = { "Content-Type": "application/json", "Authorization": "Bearer " + token };

    response = await request.loadJSON();
    // log(response)
    const portfolioID = response.current_portfolio.id;

    //Get Returns Data
    url = "https://api.kuvera.in/api/v4/user/returns.json?conditions[][state][operator]=eq&conditions[][state][value]=active&v=1.186.9";
    request = new Request(url);
    request.headers = { "Content-Type": "application/json", "Authorization": "Bearer " + token };
    response = await request.loadJSON();
    // log(response)

    return response.data[portfolioID];

}

function addItem(item, itemValue, investedVal) {

    let parentStack = listwidget.addStack()
    let labelStack = parentStack.addStack()

    parentStack.addSpacer()

    let amountStack = parentStack.addStack()

    parentStack.layoutHorizontally()
    labelStack.layoutVertically()
    amountStack.layoutVertically()

    let val = labelStack.addText(item)
    val.font = Font.mediumRoundedSystemFont(12)
    val.textColor = new Color("f0922c")

    let amountColor = Color.white();

    if (item == "Today" && String(itemValue).startsWith('-')) {
        amountColor = Color.red();
    } else if (item == "Today" && !String(itemValue).startsWith('-')) {
        amountColor = Color.green();
    } else if (item == "Current") {
        if (itemValue < investedVal) {
            amountColor = Color.red();
        } else {
            amountColor = Color.green();
        }
    }

    const amount = amountStack.addText(new Intl.NumberFormat().format(itemValue))
    amount.font = Font.mediumRoundedSystemFont(12)
    amount.textColor = amountColor

    listwidget.addSpacer(2)

}