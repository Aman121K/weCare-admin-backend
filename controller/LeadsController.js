const Leads = require("../model/LeadsModel");
const User = require("../model/UserModel");
const mongoose = require("mongoose");
var MicroInvoice = require("microinvoice");
const PDFDocument = require('pdfkit');
const { ObjectId } = require("mongodb")
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const invoicesDirectory = path.join(process.cwd(), 'invoices');
const imagesDirectory = path.join(process.cwd(), 'images');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { generateOTP, getGrandTotal } = require("../helpers/helpers");
const moment = require('moment');
const Razorpay = require("razorpay");
const apiKey = '418331AgTI875N65f5d2c5P1';

// Ensure the invoices directory exists
fs.mkdirSync(invoicesDirectory, { recursive: true });
fs.mkdirSync(imagesDirectory, { recursive: true });



const transporter = nodemailer.createTransport({
    service: 'Gmail', // For example, 'Gmail'
    auth: {
        user: 'javascript.pgl@gmail.com',
        pass: 'msdf qhmj fhbv xlbm'
    }
});
function numberToWords(amount) {
    // Implement a function to convert the amount to words
    // There are libraries available or you can write your own logic
    // For simplicity, this is a placeholder
    return amount;
}

AWS.config.update({
    accessKeyId: 'AKIAQBTFHEDH56XOG6GT',
    secretAccessKey: 'MvOAt4SQuK4pbruezUS+FOth8m9U/rpE9Eom+5ZF',
    region: 'ap-south-1'
});

const s3 = new AWS.S3();

// exports.addLeads = async (req, res) => {
//     let PdfUrl;
//     const { agent_id, warranty_status, contact_name, phone_number, email, device_brand, device_emi_number, device_images, product_value, address, price } = req.body;
//     try {
//         const agentUser = await User.find({ _id: new ObjectId(agent_id) });

//         console.log("agentUser", agentUser);
//         if (agentUser) {
//             const addLead = new Leads({
//                 agent_id: agent_id,
//                 warranty_status: warranty_status,
//                 contact_name: contact_name,
//                 phone_number: phone_number,
//                 email: email,
//                 device_brand: device_brand,
//                 device_emi_number: device_emi_number,
//                 device_images: device_images,
//                 product_value: product_value,
//                 address: address,
//                 price: price,
//                 added_date: Date.now(),
//             });
//             const newLead = await addLead.save();
//             // const currentDate = new Date().toLocaleDateString(); // Get current date
//             // const PriceData = await getGrandTotal(Number(product_value));
//             // console.log("getGrandTotal>>", PriceData)
//             // const invoiceData = {
//             //     'Company Name': "KABUJI SERVICES INDIA PRIVATE LIMITED",
//             //     'Company Address': "CO MOHAN VIR SO BRAHAM SINGH, HN 61 KH KABUJI SERVICES INDIA PRIVATE LIMITED, POST SARURPUR KALAN, BARAUT BAGHPAT ROAD, BIHARIPUR, Baghpat, Uttar Pradesh, 250619",
//             //     'PAN Number': 'AAICK6814B',
//             //     'GSTIN': '09AAICK6814B1ZM',
//             //     'Invoice Number': 'INV-001',
//             //     'Billing Address To': address,
//             //     'Date': currentDate,
//             //     'Device Emi Number': device_emi_number,
//             //     'Product Details': [
//             //         { name: device_brand, quantity: 1, price: product_value },
//             //     ],
//             //     'CGST': PriceData.TotalTax / 2,
//             //     'SGST': PriceData.TotalTax / 2,
//             //     'Grand Total': PriceData.GrandTotal,
//             // };

//             // const pdfDoc = new PDFDocument(); // Create a new PDFDocument
//             // const invoiceName = await generateUniqueInvoiceName();
//             // const pdfPath = `${__dirname}/${invoiceName}.pdf`; // Path to save the PDF

//             // // Pipe PDF content to file
//             // pdfDoc.pipe(fs.createWriteStream(pdfPath));

//             // // Generate invoice content
//             // await generateInvoice(pdfDoc, invoiceData);

//             // // End the PDF document
//             // pdfDoc.end();

//             // // Wait for PDF generation to finish before uploading to S3
//             // pdfDoc.on('finish', async () => {
//             //     try {
//             //         // Upload PDF to S3
//             //         PdfUrl = await uploadToS3(pdfPath, `${invoiceName}.pdf`); //upload s3

//             //         // Send email with PDF invoice attached
//             //         const emailOptions = {
//             //             from: 'javascript.pgl@gmail.com',
//             //             to: email,
//             //             subject: 'Your Invoice',
//             //             text: `Please find attached invoice.`,
//             //             attachments: [
//             //                 {
//             //                     fileName: `${invoiceName}.pdf`,
//             //                     path: pdfPath,
//             //                 }
//             //             ]
//             //         };

//             //         await transporter.sendMail(emailOptions);

//             //         res.send({
//             //             success: 1,
//             //             message: "Lead Added Successfully",
//             //             data: { ...newLead._doc, PdfUrl: PdfUrl }
//             //         });
//             //     } catch (error) {
//             //         console.error('Error:', error);
//             //         res.status(500).json({ message: error.message });
//             //     }
//             // });
//             res.send({
//                 success: 1,
//                 message: "Lead Added Successfully",
//                 data: { newLead }
//             });
//         }

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).s.json({ message: error.message });
//     }
// }
exports.addLeads = async (req, res) => {
    let PdfUrl;
    const { agent_id, warranty_status, contact_name, phone_number, email, device_brand, device_emi_number, device_images, product_value, address, price } = req.body;

    try {
        // Calculate Invoice Number
        const leadCount = await Leads.countDocuments();
        const invoiceNumber = `INV-${(leadCount + 1).toString().padStart(3, '0')}`;

        // Prepare the lead object
        const addLead = new Leads({
            agent_id: agent_id,
            warranty_status: warranty_status,
            contact_name: contact_name,
            phone_number: phone_number,
            device_emi_number: device_emi_number,
            device_images: device_images,
            product_value: product_value,
            address: address,
            price: price,
            added_date: Date.now(),
        });

        const newLead = await addLead.save();
        const PriceData = await getGrandTotal(Number(price));
        const currentDate = moment().format("DD-MM-YYYY");

        // Path to the logo image
        const logoPath = path.resolve(__dirname, '../images/log.png');  // Adjust the path to your logo image

        const invoiceData = {
            'Company Name': "KABUJI SERVICES INDIA PRIVATE LIMITED",
            'PAN Number': 'AAICK6814B',
            'GSTIN': '09AAICK6814B1ZM',
            'Invoice Number': invoiceNumber,
            'Billing Address From': "CO MOHAN VIR SO BRAHAM SINGH, HN 61 KH KABUJI SERVICES INDIA PRIVATE LIMITED, POST SARURPUR KALAN, BARAUT BAGHPAT ROAD, BIHARIPUR, Baghpat,Uttar Pradesh, 250619",
            'Billing Address To': address,
            'Date': currentDate,
            'Device Emi Number': device_emi_number,
            'Price': price,
            'CGST': PriceData.TotalTax / 2,
            'SGST': PriceData.TotalTax / 2,
            'Grand Total': PriceData.GrandTotal,
            'Logo': logoPath,
            'Contact Name': contact_name
        };

        const invoiceName = await generateUniqueInvoiceName();
        PdfUrl = `https://wecare1.s3.ap-south-1.amazonaws.com/${invoiceName}.pdf`;

        // Generate the invoice PDF
        const pdfBuffer = await generateInvoice(invoiceData);

        // Save the PDF to a file
        const filePath = path.join(invoicesDirectory, `${invoiceName}.pdf`);
        fs.writeFileSync(filePath, pdfBuffer);

        // Upload the PDF to S3
        await uploadToS3(filePath, `${invoiceName}.pdf`);

        // Prepare email options
        const emailOptions = {
            from: 'wcare960@gmail.com',
            to: email,
            subject: 'Your Invoice',
            text: 'Please check your invoice.',
            attachments: [
                {
                    filename: `${invoiceName}.pdf`,
                    path: filePath,
                },
            ],
        };

        // Send the email with the invoice attachment
        await transporter.sendMail(emailOptions);

        // Respond with success
        res.status(200).send({
            success: 1,
            message: "Lead Added Successfully",
            data: { ...newLead._doc, PdfUrl: PdfUrl },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.orders = async (req, res) => {
    console.log("whole request>>", req.body)
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        })
        const options = {
            amount: JSON.parse(req.body.amount) * 100,
            currency: 'INR',
            receipt: req.body.receipt
        }
        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Some error ocured");
        res.json(order)
    } catch (e) {
        res.status(500).send(e)

    }
}

exports.paymentSucces = async (req, res) => {
    try {
        // getting the details back from our font-end
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;


        console.log("Success case full details>>", orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,)

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", "w2lBtgmeuDUfnJVp43UpcaiT");

        console.log("shasum>>", shasum)

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        console.log("Digest>>", digest)

        // comaparing our digest with the actual signature
        // if (digest !== razorpaySignature) return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.log("Whole erro>>", error)
        res.status(500).send(error);
    }
};
exports.showAllLeads = async (req, res) => {
    const allLeads = await Leads.find();
    try {
        if (allLeads) {
            return res.status(200).send({
                success: 1,
                message: "Data Found",
                data: allLeads
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// exports.getInvoices = async (req, res) => {
//     try {
//         // Example invoice data (replace with your actual invoice data)
//         const invoiceData = {
//             'Invoice Number': 'INV-001',
//             'Date': '2024-03-15',
//             'Due Date': '2024-04-15',
//             'Total Amount': '100',
//             'Customer Name': 'John Doe',
//             'Customer Address': '123 Main St, Anytown, USA',
//             'Items': [
//                 { name: 'Product 1', quantity: 2, unitPrice: '$50', total: '$100' },
//                 { name: 'Product 2', quantity: 1, unitPrice: '$30', total: '$30' },
//             ],
//             'Tax': '9%',
//             'Shipping': '0.00',
//             'Grand Total': '$115',
//             // Add more invoice data as needed
//         };
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');

//         const invoiceName = generateUniqueInvoiceName();
//         // Generate the invoice PDF
//         generateInvoice(invoiceData)
//             .then(async (pdfBuffer) => {
//                 // Set response headers for PDF content
//                 const filePath = path.join(invoicesDirectory, `${invoiceName}.pdf`);
//                 fs.writeFileSync(filePath, pdfBuffer);

//                 await uploadToS3(filePath, `${invoiceName}.pdf`);

//                 const emailOptions = {
//                     from: 'javascript.pgl@gmail.com',
//                     to: email,
//                     subject: 'Your OTP',
//                     text: `Plese check your Invoice`,
//                     attachments: [
//                         {
//                             fileName: `${invoiceName}.pdf`,
//                             path: filePath,
//                         }
//                     ]
//                 };

//                 await transporter.sendMail(emailOptions);

//                 // Send the PDF buffer as response
//                 // res.send(pdfBuffer);
//             })
//             .catch((error) => {
//                 console.error('Error generating invoice:', error);
//                 res.status(500).send('Error generating invoice');
//             });
//     } catch (error) {
//         console.error('Error generating invoice:', error);
//         res.status(500).send('Error generating invoice');
//     }
// }

exports.sendOTPMail = async (req, res) => {
    const { email } = req.body;
    try {
        // Generate OTP
        const otp = generateOTP();

        // Send OTP via email
        const emailOptions = {
            from: 'javascript.pgl@gmail.com',
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        await transporter.sendMail(emailOptions);

        // Send response
        res.status(200).send({
            success: 1,
            message: "OTP Sent",
            data: { email: email, otp: otp }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Error sending OTP');
    }
};

exports.sendOTPMessage = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        // Generate OTP
        const otp = generateOTP();

        // Send OTP via email
        const message = `Your OTP is  ${otp}`;
        await sendSMS(phoneNumber);

        // Send response
        res.status(200).send({
            success: 1,
            message: "OTP Sent",
            data: { phoneNumber: phoneNumber, otp: otp }
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).send('Error sending OTP');
    }
};


function generateInvoice(invoiceData) {
    return new Promise((resolve, reject) => {
        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Buffer to store PDF content
        const pdfBuffer = [];

        // Pipe PDF content to buffer
        doc.on('data', (chunk) => {
            pdfBuffer.push(chunk);
        });

        // Add header with logo
        if (invoiceData.Logo) {
            doc.image(invoiceData.Logo, 50, 45, { width: 50 });
        }
        doc.fontSize(10).text('GSTIN : 09AAICK6814B1ZM', 110, 45);
        doc.fontSize(10).text('Original Copy', 400, 45, { align: 'right' });
        doc.moveDown();

        // Add company information
        doc.fontSize(12).text('KABUJI SERVICES INDIA PRIVATE LIMITED', { align: 'center' });
        doc.fontSize(10).text('CO MOHAN VIR SO BRAHAM SINGH, HN 61 KH KABUJI SERVICES INDIA PRIVATE LIMITED, POST SARURPUR KALAN, BARAUT BAGHPAT ROAD, BIHARIPUR, Baghpat, Uttar Pradesh, 250619', { align: 'center' });
        doc.fontSize(10).text('Mob. 9411023367', { align: 'center' });
        doc.moveDown(2);

        // Invoice title
        doc.fontSize(15).text('TAX INVOICE', { align: 'center' });
        doc.moveDown(2);

        // Invoice and billing details
        doc.fontSize(10).text(`Invoice No.: ${invoiceData['Invoice Number']}`, 50)
            .text(`Date: ${invoiceData['Date']}`, 200)
            .text(`Place of Supply: Uttar Pradesh (09)`, 350);
        doc.moveDown();

        // Billed to and shipped to information
        doc.fontSize(10).text(`Billed to.: ${invoiceData['Contact Name']}`,30)
        // doc.text('Billed to:', 50, 200);
        doc.text(invoiceData['Billing Address To'], 50, 215);
        doc.text('GSTIN/UIN:', 50, 250);

        doc.text('Shipped to:', 350, 200);
        doc.text(invoiceData['Billing Address To'], 350, 215);
        doc.text('GSTIN/UIN:', 350, 250);

        doc.moveDown(2);

        // Table headers
        doc.fontSize(10).text('S.N.', 40, 300)
            .text('Description of Goods', 80, 300)
            .text('Unit Price', 210, 300)
            .text('Qty.', 290, 300)
            .text('Net Amount', 330, 300)
            .text('Tax', 430, 300)
            .text('Tax Type', 460, 300)
            .text('Tax Amount', 490, 300)
            .text('Total Amount', 530, 300);

        // Add item details (example with one item)
        doc.text('1', 40, 320)
            .text(invoiceData['Device Emi Number'], 80, 320)
            .text(invoiceData['Price'], 210, 320)
            .text('1', 290, 320)
            .text(invoiceData['Price'], 330, 320)
            .text(`${(invoiceData['CGST'] + invoiceData['SGST']).toFixed(2)}`, 430, 320)
            .text('GST', 450, 320)
            .text((invoiceData['CGST'] + invoiceData['SGST']).toFixed(2), 490, 320)
            .text(invoiceData['Grand Total'], 530, 320);

        doc.moveDown(2);

        // Grand Total
        doc.text('Grand Total', 450, 340);
        doc.text(invoiceData['Grand Total'], 550, 340);

        doc.moveDown(2);

        // Amount in words (requires a function to convert numbers to words)
        doc.text(`Rupees in Words: ${numberToWords(invoiceData['Grand Total'])}`, 50, 380);

        doc.moveDown(2);

        // Signature and notes
        doc.text('For Kabuji Services India Private Limited', 450, 400);
        doc.text('Authorized Signatory', 450, 420);

        doc.moveDown(4);

        doc.text('Note:', 50, 450);
        doc.text('All Terms & Conditions apply by Kabuji Services India Pvt. Ltd.', 50, 470);

        // Finalize the PDF document
        doc.end();

        // Resolve the promise with the PDF buffer when the PDF is generated
        doc.on('end', () => {
            resolve(Buffer.concat(pdfBuffer));
        });

        // Handle errors
        doc.on('error', (error) => {
            reject(error);
        });
    });
}
async function generateUniqueInvoiceName() {
    const timestamp = Date.now(); // Get current timestamp
    const randomString = uuidv4(); // Generate random string using uuid module
    return `invoice_${timestamp}_${randomString}`;
}

function uploadToS3(filePath, fileName) {
    return new Promise((resolve, reject) => {
        const fileContent = fs.readFileSync(filePath);

        const params = {
            Bucket: 'wecare1',
            Key: fileName,
            Body: fileContent
        };

        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function sendSMS(phoneNumber, message) {
    try {
        const response = await axios.post('https://api.msg91.com/api/v2/sendsms', {
            sender: 'SENDER_ID', // Your sender ID
            route: '4', // Transactional route
            country: '91', // Country code (India in this case)
            to: '79739605798', // Phone number(s) to which the message will be sent
            sms: [
                {
                    message: 'This is a test message regergre from MSG91'
                }
            ]
        }, {
            headers: {
                'authkey': apiKey
            }
        });

        console.log('Message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error.response.data);
        throw error.response.data;
    }
}


exports.tests = async (req, res) => {
    res.status(200).send({
        success: 1,
        message: "OTP Sent",
        // data: { phoneNumber: phoneNumber, otp: otp }
    });
    testing(10)


}
function testing(num) {
    console.log(num);
    const newNum = num + 5;
    console.log("New num is>>", newNum);
}

//logo company name
//pan numer gst number
//billing address from
//billing address to
//device
//device price
//payble amount

//total