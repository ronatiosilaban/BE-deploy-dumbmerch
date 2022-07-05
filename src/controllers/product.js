const { product, user, category, productCategory } = require("../../models");
const cloudinary = require('../utils/cloudinary');

exports.addProduct = async (req, res) => {
    try {
        let { categoryId } = req.body;

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'dumbmerch',
            use_filename: true,
            unique_filename: false,
        });

        console.log(req.user);
        if (categoryId) {
            categoryId = categoryId.split(',');
        }

        const data = {
            title: req.body.title,
            desc: req.body.desc,
            price: req.body.price,
            image: result.public_id,
            qty: req.body.qty,
            idUser: req.user.id,
        };

        let newProduct = await product.create(data);

        if (categoryId) {
            const productCategoryData = categoryId.map((item) => {
                return { idProduct: newProduct.id, idCategory: parseInt(item) };
            });
            console.log("productCategory", productCategoryData);
            await productCategory.bulkCreate(productCategoryData);
        }

        let productData = await product.findOne({
            where: {
                id: newProduct.id,
            },
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password'],
                    },
                },
                {
                    model: category,
                    as: 'categories',
                    through: {
                        model: productCategory,
                        as: 'bridge',
                        attributes: [],
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                },
            ],
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idUser'],
            },
        });
        productData = JSON.parse(JSON.stringify(productData));

        res.send({
            status: 'success...',
            data: {
                ...productData,
                image: process.env.PATH_FILE + productData.image,
            },
        });
    } catch (error) {


        res.status(500).send({
            status: 'failed',
            message: error.message,
        });
    }
};

exports.getProduct = async (req, res) => {

    try {
        const dataAll = await product.findAll({
            include: [
                {
                    model: user,
                    as: "user",
                    attributes: {
                        exclude: ["createdAt", "updatedAt", "password"],
                    },
                },
                // code here
                {
                    model: category,
                    as: "categories",
                    through: {
                        model: productCategory,
                        as: "bridge",
                        attributes: {
                            exclude: [],
                        }
                    },
                    attributes: {
                        exclude: ["createdAt", "updatedAt"],
                    },
                }
            ],
            attributes: {
                exclude: ["createdAt", "updatedAt", "idUser"],
            },
        });

        let FILE_PATH = 'http://localhost:5000/uploads/'
        data = JSON.parse(JSON.stringify(dataAll))

        data = data.map((item) => {
            return { ...item, image: process.env.PATH_FILE + item.image };
        });


        res.send({
            status: "success...",
            data,
        });


    } catch (error) {
        console.log(error);
        res.send({
            status: "failed",
            message: "Server Error",
        });
    }
}




exports.getProducts = async (req, res) => {
    try {
        const { id } = req.params;
        let dataAll = await product.findOne({
            where: {
                id,
            },
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password'],
                    },
                },
                {
                    model: category,
                    as: 'categories',
                    through: {
                        model: productCategory,
                        as: 'bridge',
                        attributes: [],
                    },
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                },
            ],
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idUser'],
            },
        });

        let FILE_PATH = 'http://localhost:5000/uploads/'
        data = JSON.parse(JSON.stringify(dataAll))

        data = {
            ...data,
            image: FILE_PATH + data.image

        }

        res.send({
            status: 'success...',
            data,
        });
    } catch (error) {
        console.log(error);
        res.send({
            status: 'failed',
            message: 'Server Error',
        });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let { categoryId } = req.body;
        categoryId = await categoryId.split(',');

        const dataAll = {
            title: req?.body?.title,
            desc: req?.body.desc,
            price: req?.body?.price,
            image: req?.file?.filename,
            qty: req?.body?.qty,
            idUser: req?.user?.id,
        };

        await productCategory.destroy({
            where: {
                idProduct: id,
            },
        });

        let productCategoryData = [];
        if (categoryId != 0 && categoryId[0] != '') {
            productCategoryData = categoryId.map((item) => {
                return { idProduct: parseInt(id), idCategory: parseInt(item) };
            });
        }

        if (productCategoryData.length != 0) {
            await productCategory.bulkCreate(productCategoryData);
        }

        await product.update(dataAll, {
            where: {
                id,
            },
        });

        res.send({
            status: 'success',
            data: {
                id,
                data,
                productCategoryData,
                image: req?.file?.filename,
            },
        });
    } catch (error) {
        console.log(error);
        res.send({
            status: 'failed',
            message: 'Server Error',
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        await product.destroy({
            where: {
                id
            }
        })

        res.send({
            status: 'success',
            message: `Delete user id: ${id} finished`
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}