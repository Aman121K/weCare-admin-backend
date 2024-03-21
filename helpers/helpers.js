function generateOTP() {
    const digits = '0123456789';
    let OTP = '';

    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }

    return OTP;
}
function getGrandTotal(productPrice) {
    const TotalTax = productPrice * 18 / 100;
    const GrandTotal = productPrice + TotalTax;
    return { TotalTax, GrandTotal };
}
module.exports = { generateOTP, getGrandTotal }   