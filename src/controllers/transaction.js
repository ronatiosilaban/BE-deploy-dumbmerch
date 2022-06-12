const { user, transaction, product, profile } = require('../../models')

const midtransClient = require('midtrans-client')
const convertRupiah = require("rupiah-format");

const nodemailer = require("nodemailer");

exports.getTransactions = async (req, res) => {
    try {

        const dataAll = await transaction.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idBuyer', "idSeller", 'idProduct']
            },
            include: [
                {
                    model: product,
                    as: 'product',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'idUser', 'qty', 'idProduct']
                    }
                },
                {
                    model: user,
                    as: 'buyer',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'status', 'idBuyer', "idSeller", 'idProduct']
                    }
                },
                {
                    model: user,
                    as: 'seller',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'status', 'idBuyer', "idSeller", 'idProduct']
                    }
                },
            ]
        })


        res.send({
            status: 'success',
            data: dataAll
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

exports.addTransaction = async (req, res) => {
    try {
        // Prepare transaction data from body here ...
        let data = req.body;
        data = {
            id: parseInt(data.idProduct + Math.random().toString().slice(3, 8)),
            ...data,
            idBuyer: req.user.id,
            status: "pending",
        };

        // Insert transaction data here ...
        const newData = await transaction.create(data);

        // Get buyer data here ...
        const buyerData = await user.findOne({
            include: {
                model: profile,
                as: "profile",
                attributes: {
                    exclude: ["createdAt", "updatedAt", "idUser"],
                },
            },
            where: {
                id: newData.idBuyer,
            },
            attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
            },
        });

        let snap = new midtransClient.Snap({
            isProduction: false,
            serverKey: process.env.MIDTRANS_SERVER_KEY,
        });

        const price = newData.price * newData.amount


        let parameter = {
            transaction_details: {
                order_id: newData.id,
                gross_amount: price,
            },
            credit_card: {
                secure: true,
            },
            customer_details: {
                full_name: buyerData?.username,
                email: buyerData?.email,
                phone: buyerData?.profile?.phone,
            },
        };

        const payment = await snap.createTransaction(parameter);

        res.send({
            status: "pending",
            message: "Pending transaction payment gateway",
            payment,
            newData,
            product: {
                id: data.idProduct,
            },
        });
        console.log('harga', payment);
    } catch (error) {
        console.log(error);
        res.send({
            status: "failed",
            message: "Server Error",
        });
    }
};
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
    isProduction: false,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY,
});

/**
 *  Handle update transaction status after notification
 * from midtrans webhook
 * @param {string} status
 * @param {transactionId} transactionId
 */

// Create function for handle https notification / WebHooks of payment status here ...
exports.notification = async (req, res) => {
    try {
        const statusResponse = await core.transaction.notification(req.body);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        console.log('transaction status', transactionStatus);
        if (transactionStatus == "capture") {
            if (fraudStatus == "challenge") {
                console.log('challenge');
                // TODO set transaction status on your database to 'challenge'
                // and response with 200 OK
                sendEmail("pending", orderId); //sendEmail with status pending and order id
                handleTransaction("pending", orderId);
                res.status(200);
            } else if (fraudStatus == "accept") {
                console.log('accept');
                // TODO set transaction status on your database to 'success'
                // and response with 200 OK
                sendEmail("success", orderId); //sendEmail with status success and order id
                updateProduct(orderId);
                handleTransaction("success", orderId);
                res.status(200);
            }
        } else if (transactionStatus == "settlement") {
            console.log('settlement');
            // TODO set transaction status on your database to 'success'
            // and response with 200 OK
            sendEmail("success", orderId); //sendEmail with status success and order id
            updateProduct(orderId);
            handleTransaction("success", orderId);
            res.status(200);
        } else if (
            transactionStatus == "cancel" ||
            transactionStatus == "deny" ||
            transactionStatus == "expire"
        ) {
            console.log('failed');
            // TODO set transaction status on your database to 'failure'
            // and response with 200 OK
            sendEmail("failed", orderId); //sendEmail with status failed and order id
            handleTransaction("failed", orderId);
            res.status(200);
        } else if (transactionStatus == "pending") {
            console.log('pending');
            // TODO set transaction status on your database to 'pending' / waiting payment
            // and response with 200 OK
            sendEmail("pending", orderId); //sendEmail with status pending and order id
            handleTransaction("pending", orderId);
            res.status(200);
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};




exports.getTransaction = async (req, res) => {
    try {
        const { id } = req.params

        const dataAll = await transaction.findOne({
            where: {
                id: id
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idBuyer', "idSeller", 'idProduct']
            },
            include: [
                {
                    model: product,
                    as: 'product',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'idUser', 'qty', 'idProduct']
                    }
                },
                {
                    model: user,
                    as: 'buyer',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'status', 'idBuyer', "idSeller", 'idProduct']
                    }
                },
                {
                    model: user,
                    as: 'seller',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password', 'status', 'idBuyer', "idSeller", 'idProduct']
                    }
                },
            ]
        })

        // let PATH_FILE = 'http://localhost:5000/uploads/'
        // data = JSON.parse(JSON.stringify(dataAll))
        // data = ({
        //     ...data,
        //     image: data.image ? process.env.PATH_FILE + data.image : null
        // })



        res.send({
            status: "success",
            dataAll,
            idUser: user
        })

    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}



const handleTransaction = async (status, transactionId) => {
    await transaction.update(
        {
            status,
        },
        {
            where: {
                id: transactionId,
            },
        }
    );
};


const updateProduct = async (orderId) => {
    const transactionData = await transaction.findOne({
        where: {
            id: orderId,
        },
    });
    const productData = await product.findOne({
        where: {
            id: transactionData.idProduct,
        },
    });
    const qty = productData.qty - 1;
    await product.update({ qty }, { where: { id: productData.id } });
};

const sendEmail = async (status, transactionId) => {
    // Config service and email account
    let cred = {
        user: process.env.SYSTEM_EMAIL,
        pass: process.env.SYSTEM_PASSWORD,
    };
    const transporter = nodemailer.createTransport({
        // service: "gmail",
        // auth: cred
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: cred

    });
    // console.log('user', auth);
    // Get transaction data
    let data = await transaction.findOne({
        where: {
            id: transactionId,
        },
        attributes: {
            exclude: ["createdAt", "updatedAt", "password"],
        },
        include: [
            {
                model: user,
                as: "buyer",
                attributes: {
                    exclude: ["createdAt", "updatedAt", "password", "status"],
                },
            },
            {
                model: product,
                as: "product",
                attributes: {
                    exclude: [
                        "createdAt",
                        "updatedAt",
                        "idUser",
                        "qty",
                        "price",
                        "desc",
                    ],
                },
            },
        ],
    });

    data = JSON.parse(JSON.stringify(data));
    const price = data.price * data.amount
    // Email options content
    console.log('=======', data);
    const mailOptions = {

        from: process.env.SYSTEM_EMAIL,
        to: data.buyer.email,
        subject: "Payment status",
        text: "Your payment is <br />" + status,
        html: `<!DOCTYPE html>
              <html lang="en">
                <head>
                  <meta charset="UTF-8" />
                  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Document</title>
                  <style>
                    h1 {
                      color: brown;
                    }
                  </style>
                </head>
                <body>
                  <h2>Product payment :</h2>
                  <ul style="list-style-type:none;">
                    <li>Name : ${data.product.title}</li>
                    <li>Total payment: ${convertRupiah.convert(price)}</li>
                    <li>Status : <b>${status}</b></li>
                  </ul>  
                </body>
              </html>`,
    };

    // Send an email if there is a change in the transaction status
    if (data.status != status) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            console.log("Email sent: " + info.response);
            console.log(err);
            return res.send({
                status: "Success",
                message: info.response,

            });
        });
    }
};