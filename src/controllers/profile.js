const { profile, user } = require('../../models')

exports.addProfile = async (req, res) => {
    try {
        const data = req.body
        const createData = await profile.create(data)

        res.send({
            status: 'success',
            data: createData
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
};

exports.getProfiles = async (req, res) => {
    try {
        const idUser = req.user.id;

        let data = await profile.findOne({
            where: {
                idUser,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idUser'],
            },
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'password'],
                    },
                },]
        });

        data = JSON.parse(JSON.stringify(data));

        data = {
            ...data,
            image: data ? process.env.PATH_FILE + data.image : null,
            data
        };

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
};



exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params

        const data = await profile.findOne({
            where: {
                id
            },
            include: {
                model: user,
                as: "user",
                attributes: {
                    exclude: ['updatedAt', 'createdAt']
                }
            },
            attributes: {
                exclude: ['updatedAt', 'createdAt', 'idUser']
            }
        })


        res.send({
            status: "success",
            data: data,
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

exports.updateProfile = async (req, res) => {
    try {
        console.log('aaa');
        const { id } = req.params

        await profile.update(req.body, {
            where: {
                id
            },
            include: {
                model: user,
                as: "user",
                attributes: {
                    exclude: ['updatedAt', 'createdAt']
                }
            }
        })
        console.log(id);
        res.send({
            status: 'success',
            message: `Update user id: ${id} finished`,
            data: req.body
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

exports.deleteProfile = async (req, res) => {
    try {
        const { id } = req.params

        await profile.destroy({
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