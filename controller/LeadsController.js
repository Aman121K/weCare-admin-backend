const Leads = require("../model/LeadsModel")

exports.addLeads = async (req, res) => {
    const { user_id, warranty_status, contact_name, phone_number, email, device_brand, device_emi_number, device_images, product_value, price } = req.body;

    const addLead = new Leads({
        user_id: user_id,
        warranty_status: warranty_status,
        contact_name: contact_name,
        phone_number: phone_number,
        email: email,
        device_brand: device_brand,
        device_emi_number: device_emi_number,
        device_images: device_images,
        product_value: product_value,
        price: price,
        added_date: Date.now(),
    });

    try {
        const newLead = await addLead.save();
        res.status(200).send({
            success: 1, message: "Lead Added Successfully", data: newLead
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