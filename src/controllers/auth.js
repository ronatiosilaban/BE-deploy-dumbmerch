const { user } = require("../../models")

const Joi = require("joi");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required(),
    });


    const { error } = schema.validate(req.body);


    if (error)
        return res.status(400).send({
            error: {
                message: error.details[0].message,
            },
        });

    try {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = await user.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            status: "customer",
        });

        const token = jwt.sign({ id: user.id }, process.env.TOKEN_KEY);

        res.status(200).send({
            status: "success...",
            data: {
                username: newUser.username,
                email: newUser.email,
                token,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: "failed",
            message: "Server Error",
        });
    }
};


exports.login = async (req, res) => {

    const schema = Joi.object({
        email: Joi.string().email().min(6).required(),
        password: Joi.string().min(6).required(),
    });


    const { error } = schema.validate(req.body);

    if (error)
        return res.status(400).send({
            error: {
                message: error.details[0].message,
            },
        });

    try {
        const userExist = await user.findOne({
            where: {
                email: req.body.email,
            },
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        });

        const isValid = await bcrypt.compare(req.body.password, userExist.password);

        if (!isValid) {
            return res.status(400).send({
                status: "failed",
                message: "email & password doesnt macth",
            });
        }

        // const dataToken = {
        //     id: userExist.id
        // }

        const SECRET_KEY = "rahasiasekali"
        // const token = jwt.sign(dataToken, SECRET_KEY)
        const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY);
        console.log(process.env.TOKEN_KEY);

        res.status(200).send({
            status: "success...",
            data: {
                id: userExist.id,
                username: userExist.username,
                email: userExist.email,
                status: userExist.status,
                token,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            status: "failed",
            message: "account not found",
        });
    }
};

exports.checkAuth = async (req, res) => {
    try {
        const id = req.user.id;

        const dataUser = await user.findOne({
            where: {
                id,
            },
            attributes: {
                exclude: ["createdAt", "updatedAt", "password"],
            },
        });

        if (!dataUser) {
            return res.status(404).send({
                status: "failed",
            });
        }

        res.send({
            status: "success...",
            data: {
                user: {
                    id: dataUser.id,
                    username: dataUser.username,
                    email: dataUser.email,
                    status: dataUser.status,
                },
            },
        });
    } catch (error) {
        console.log(error);
        res.status({
            status: "failed",
            message: "Server Error",
        });
    }
};