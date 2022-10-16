//Import the library into your project
var easyinvoice = require('easyinvoice');
var { sendInvoice } = require('../emails/account');
var fs = require('fs')

const createInvoice = async (invData) => {
    const customer = {
        c_email: invData.email,
        c_name : invData.name,
        c_address: invData.address.c_address,
        c_city: invData.address.c_city,
        c_zip: invData.address.c_postalcode,
        c_country: invData.address.c_country
    }
    var products = invData.items.map(value => {
        return {
            "quantity": value.quantity,
            "description": (value.d_name).replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
            "tax-rate": 0,
            "price": value.d_cost
        }
    })
    var data = {
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        "customize": {
            //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
        },
        "images": {
            // The logo on top of your invoice
            "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
            // The invoice background
            // "background": "https://media.istockphoto.com/vectors/paid-stamp-paid-square-grunge-sign-label-vector-id1247811896"
        },
        // Your own data
        "sender": {
            "company": "Alimento",
            "address": "Alimento, Lucknow, India",
            "zip": "226010",
            "city": "Lucknow",
            "country": "India"
        },
        // Your recipient
        "client": {
            "company": customer.c_name,
            "address": customer.c_address,
            "zip": customer.c_zip,
            "city": customer.c_city,
            "country": customer.c_country
        },
        "information": {
            // Invoice number
            "number": "2021.0001",
            // Invoice data
            "date": "12-12-2021",
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        "products": products,
        // Settings to customize your invoice
        "settings": {
            "currency": "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
            "locale": "en-IN", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
        }
    };
    
    //Create your invoice! Easy!
    const result = await easyinvoice.createInvoice(data);
    fs.writeFileSync(`./views/Customer/invoices/${invData.o_id}.pdf`, result.pdf, 'base64');
    sendInvoice(customer.c_email, result.pdf);
}

module.exports = {createInvoice};