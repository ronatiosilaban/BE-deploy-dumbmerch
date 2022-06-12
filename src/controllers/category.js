const { category, categoryProduct } = require('../../models')

exports.addCategory = async (req, res) => {
    try {
        const data = req.body
        const createData = await category.create(data)

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
}

exports.getCategories = async (req, res) => {

    try {
        console.log('bbb');
        const dataAll = await category.findAll({
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'idUser']
            }
        })

        // data = JSON.parse(JSON.stringify(dataAll))

        // console.log('fak', data)

        res.send({
            status: "success",
            data: dataAll

        })
    } catch (error) {
        console.log(error);

        res.send({
            status: "failed",
            message: "server error"
        })
    }
}




exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params

        const data = await category.findOne({
            where: {
                id
            },
            attributes: {
                exclude: ['updatedAt', 'createdAt', 'idUser']
            }
        })


        res.send({
            status: "success",
            data,

        })

    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
}

exports.updateCategory = async (req, res) => {
    try {
        console.log('aaa');
        const { id } = req.params
        // const data = req.body
        // console.log('bw', data);

        const dataAll = {
            name: req.body.name,
        };

        await category.update(dataAll, {
            where: {
                id,
            },
        });

        // console.log(req.body);
        res.send({
            status: 'success',
            message: `Update user id: ${id} finished`,
            data: {
                id,
                dataAll,

            },
        })
    } catch (error) {
        console.log(error)
        res.send({
            status: 'failed',
            message: 'Server Error'
        })
    }
    //     const { id } = req.params;
    //     const newCategory = await category.update(req.body, {
    //         where: {
    //             id,
    //         },
    //     });

    //     res.send({
    //         status: "success...",
    //         data: {
    //             id: newCategory.id,
    //             name: newCategory.name,
    //         },
    //     });
    // } catch (error) {
    //     console.log(error);
    //     res.status(500).send({
    //         status: "failed",
    //         message: "Server Error",
    //     });
    // }
}

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params

        await category.destroy({
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