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
        const currentDate = moment().format("DD-MM-YYYY");
        console.log(currentDate);
        const invoiceData = {
            'Company Name': "WeCare",
            'PAN Number': '11312321321',
            'GSTIN': 'fewfewf131321412ewf',
            'Invoice Number': 'INV-001',
            'Billing Address From': "#114 chd",
            'Billing Address To': address,
            'Date': currentDate,
            'Device Emi Number': device_emi_number,
            'Total Amount': price,
            'CGST': '$10',
            'SGST': '$5',
            'Grand Total': '$115',
            // Add more invoice data as needed
        };
        const invoiceName = await generateUniqueInvoiceName();
        PdfUrl = `https://wecare1.s3.ap-south-1.amazonaws.com/${invoiceName}.pdf`
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
            })
        res.status(200).send({
            success: 1, message: "Lead Added Successfully", data: { ...newLead._doc, PdfUrl: PdfUrl }
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

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
            'Total Amount': '$100',
            'Customer Name': 'John Doe',
            'Customer Address': '123 Main St, Anytown, USA',
            'Items': [
                { name: 'Product 1', quantity: 2, unitPrice: '$50', total: '$100' },
                { name: 'Product 2', quantity: 1, unitPrice: '$30', total: '$30' },
            ],
            'Tax': '$10',
            'Shipping': '$5',
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

// Function to generate the invoice PDF
function generateInvoice(invoiceData) {
    return new Promise((resolve, reject) => {
        // Create a new PDF document
        const doc = new PDFDocument();

        // Buffer to store PDF content
        const pdfBuffer = [];

        // Pipe PDF content to buffer
        doc.on('data', (chunk) => {
            pdfBuffer.push(chunk);
        });

        // Generate PDF content
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Add invoice data
        for (const [label, value] of Object.entries(invoiceData)) {
            doc.text(`${label}: ${value}`);
        }

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


//logo company name
//pan numer gst number
//billing address from
//billing address to
//device
//device price
//payble amount

//total