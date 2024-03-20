const Leads = require("../model/LeadsModel")
var MicroInvoice = require("microinvoice");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const invoicesDirectory = path.join(process.cwd(), 'invoices');
const imagesDirectory = path.join(process.cwd(), 'images');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { generateOTP } = require("../helpers/helpers");
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


AWS.config.update({
    accessKeyId: 'AKIAQBTFHEDH56XOG6GT',
    secretAccessKey: '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',
    region: 'ap-south-1'
});

const s3 = new AWS.S3();

exports.addLeads = async (req, res) => {
    let PdfUrl;
    const { agent_id, warranty_status, contact_name, phone_number, email, device_brand, device_emi_number, device_images, product_value, address, price } = req.body;

    const addLead = new Leads({
        agent_id: agent_id,
        warranty_status: warranty_status,
        contact_name: contact_name,
        phone_number: phone_number,
        email: email,
        device_brand: device_brand,
        device_emi_number: device_emi_number,
        device_images: device_images,
        product_value: product_value,
        address: address,
        price: price,
        added_date: Date.now(),
    });

    try {
        const newLead = await addLead.save();
        const currentDate = new Date().toLocaleDateString(); // Get current date
        const invoiceData = {
            'Company Name': "WeCare",
            'Company Address': "#114 chd",
            'PAN Number': '11312321321',
            'GSTIN': 'fewfewf131321412ewf',
            'Invoice Number': 'INV-001',
            'Billing Address To': address,
            'Date': currentDate,
            'Device Emi Number': device_emi_number,
            'Product Details': [
                { name: device_brand, quantity: 1, price: product_value },

            ],
            'price': price
        };

        // Generate PDF invoice
        const pdfDoc = new PDFDocument(); // Create a new PDFDocument
        const invoiceName = await generateUniqueInvoiceName();
        const pdfPath = `${__dirname}/${invoiceName}.pdf`; // Path to save the PDF

        // Set response headers for PDF content
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}.pdf"`);

        pdfDoc.pipe(fs.createWriteStream(pdfPath)); // Pipe PDF content to file
        generateInvoice(pdfDoc, invoiceData); // Generate invoice content
        pdfDoc.end(); // End the PDF document

        PdfUrl = `https://wecare1.s3.ap-south-1.amazonaws.com/${invoiceName}.pdf`;

        // Send email with PDF invoice attached
        const emailOptions = {
            from: 'javascript.pgl@gmail.com',
            to: email,
            subject: 'Your Invoice',
            text: `Please find attached invoice.`,
            attachments: [
                {
                    fileName: `${invoiceName}.pdf`,
                    path: pdfPath,
                }
            ]
        };

        await transporter.sendMail(emailOptions);

        res.status(200).send({
            success: 1, message: "Lead Added Successfully", data: { ...newLead._doc, PdfUrl: PdfUrl }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.orders = async (req, res) => {
    try {

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        })
        const options = {
            amount: 10000,
            currency: 'INR',
            receipt: "Order_id_123"
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

        // Creating our own digest
        // The format should be like this:
        // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
        const shasum = crypto.createHmac("sha256", "w2lBtgmeuDUfnJVp43UpcaiT");

        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

        const digest = shasum.digest("hex");

        // comaparing our digest with the actual signature
        if (digest !== razorpaySignature)
            return res.status(400).json({ msg: "Transaction not legit!" });

        // THE PAYMENT IS LEGIT & VERIFIED
        // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT

        res.json({
            msg: "success",
            orderId: razorpayOrderId,
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
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
exports.getInvoices = async (req, res) => {
    try {
        // Example invoice data (replace with your actual invoice data)
        const invoiceData = {
            'Invoice Number': 'INV-001',
            'Date': '2024-03-15',
            'Due Date': '2024-04-15',
            'Total Amount': '100',
            'Customer Name': 'John Doe',
            'Customer Address': '123 Main St, Anytown, USA',
            'Items': [
                { name: 'Product 1', quantity: 2, unitPrice: '$50', total: '$100' },
                { name: 'Product 2', quantity: 1, unitPrice: '$30', total: '$30' },
            ],
            'Tax': '9%',
            'Shipping': '0.00',
            'Grand Total': '$115',
            // Add more invoice data as needed
        };
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');

        const invoiceName = generateUniqueInvoiceName();
        // Generate the invoice PDF
        generateInvoice(invoiceData)
            .then(async (pdfBuffer) => {
                // Set response headers for PDF content
                const filePath = path.join(invoicesDirectory, `${invoiceName}.pdf`);
                fs.writeFileSync(filePath, pdfBuffer);

                await uploadToS3(filePath, `${invoiceName}.pdf`);

                const emailOptions = {
                    from: 'javascript.pgl@gmail.com',
                    to: email,
                    subject: 'Your OTP',
                    text: `Plese check your Invoice`,
                    attachments: [
                        {
                            fileName: `${invoiceName}.pdf`,
                            path: filePath,
                        }
                    ]
                };

                await transporter.sendMail(emailOptions);

                // Send the PDF buffer as response
                res.send(pdfBuffer);
            })
            .catch((error) => {
                console.error('Error generating invoice:', error);
                res.status(500).send('Error generating invoice');
            });
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).send('Error generating invoice');
    }
}

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


function generateInvoice(pdfDoc, data) {
    pdfDoc.fontSize(12);
    pdfDoc.text(data['Company Name'], { align: 'center', underline: true });
    pdfDoc.moveDown();
    pdfDoc.text(data['Company Address'], { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.text(`GST No.: ${data['GSTIN']}`);
    pdfDoc.text(`PAN Number: ${data['PAN Number']}`);
    pdfDoc.moveDown();
    pdfDoc.text('Invoice Details', { underline: true });
    pdfDoc.moveDown();
    pdfDoc.text(`Invoice Number: ${data['Invoice Number']}`);
    pdfDoc.text(`Date: ${data['Date']}`);
    pdfDoc.text(`Billing Address To: ${data['Billing Address To']}`);
    pdfDoc.text(`Device Emi Number: ${data['Device Emi Number']}`);
    pdfDoc.moveDown();
    pdfDoc.text('Product Details', { underline: true });
    pdfDoc.moveDown();
    data['Product Details'].forEach(product => {
        pdfDoc.text(`${product.name}: Quantity - ${product.quantity}, Price - ${product.price}`);
    });
    pdfDoc.moveDown();
    pdfDoc.text('GST Calculation', { underline: true });
    pdfDoc.moveDown();
    pdfDoc.text(`CGST: ${data['CGST']}`);
    pdfDoc.text(`SGST: ${data['SGST']}`);
    pdfDoc.moveDown();
    pdfDoc.text(`Grand Total: ${data['Grand Total']}`);
    pdfDoc.moveDown();
    pdfDoc.text('Terms & Conditions*', { underline: true });
    pdfDoc.moveDown();
    pdfDoc.text('1. Damage and liquid damage are not covered.');
    pdfDoc.text('2. A service request must be generated within 48 hours.');
    pdfDoc.text('3. Pressure display is not covered.');
    pdfDoc.text('4. Internal issues are covered in this warranty.');
    pdfDoc.text('5. This warranty starts after 365 days.');
    // Add more terms and conditions as needed
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


//logo company name
//pan numer gst number
//billing address from
//billing address to
//device
//device price
//payble amount

//total