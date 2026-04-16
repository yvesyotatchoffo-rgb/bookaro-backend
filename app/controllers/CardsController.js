const db = require("../models");
const services = require("../services");
const { message } = require("../services");
const { success } = require("../services/Response");
const constants = require("../utls/constants");
var mongoose = require("mongoose");
const { ObjectId } = require("mongoose").Types;
const stripe = require("stripe")(process.env.STRIPE_KEY);


module.exports = {

    // addCard: async (req, res) => {
    //     try {
    //         let userId = req.body.id;
    //         let customerId;
    //         let findUser = await db.users.findOne({ _id: userId, isDeleted: false });
    //         if (!findUser) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "User not found."
    //             })
    //         }
    //         customerId = findUser.customerId;
    //         if (!customerId) {
    //             let create_customer_payload = {
    //                 fullName: findUser.fullName,
    //                 email: findUser.email,
    //                 country: findUser.country,
    //                 pinCode: findUser.pinCode
    //             }
    //             let create_stripe_customer = await services.StripeServices.create_customer(create_customer_payload);
    //             if (create_stripe_customer) {
    //                 let updateUser = await db.users.updateOne(
    //                     { _id: userId },
    //                     { customerId: create_stripe_customer.id }
    //                 )
    //                 customerId = create_stripe_customer.id;
    //             } else {
    //                 return res.status(400).json({
    //                     success: false,
    //                     message: "Error adding Card",
    //                 })
    //             }
    //         }
    //         const source = req.body.token;
    //         let create_customer_source = await services.StripeServices.create_customer_source({
    //             stripe_customer_id: customerId,
    //             source: source,
    //             metadata: {
    //                 userId: userId
    //             }
    //         })
    //         let existingCard = await db.cards.findOne({
    //             userId: userId,
    //             last4: create_customer_source.last4,
    //             isDeleted: false,
    //             paymentMethod: "stripe",
    //         });
    //         if (existingCard) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "Card alreay exists."
    //             })
    //         }
    //         let primary_card = await db.cards.findOne({
    //             userId: findUser._id,
    //             isDeleted: false,
    //             isPrimary: true,
    //             paymentMethod: "stripe",
    //         });
    //         let obj = {};
    //         if (!primary_card) {
    //             obj.isPrimary = true;
    //         }

    //         obj.addedBy = req.identity.id;
    //         obj.cardId = create_customer_source.id;
    //         obj.fullName = findUser.fullName;
    //         obj.country = create_customer_source.country;
    //         obj.brand = create_customer_source.brand;
    //         obj.customerId = create_customer_source.customer;
    //         obj.pincode = create_customer_source.address_zip;
    //         obj.exp_month = create_customer_source.exp_month;
    //         obj.exp_year = create_customer_source.exp_year;
    //         obj.last4 = create_customer_source.last4;
    //         obj.paymentMethod = "stripe";
    //         obj.userId = req.body.id;
    //         // console.log(create_customer_source.address_zip);
    //         let addCard = await db.cards.create(obj);
    //         if (addCard) {
    //             if (addCard.isPrimary) {
    //                 await services.StripeServices.update_stripe_customer({
    //                     stripe_customer_id: customerId,
    //                     source_id: create_customer_source.id,
    //                 });
    //             }
    //             let resData = {
    //                 cardId: addCard.cardId
    //             };
    //             return res.status(200).json({
    //                 success: true,
    //                 message: constants.CARD.ADDED,
    //                 card: resData
    //             })
    //         }
    //         throw constants.onBoarding.SERVER_ERROR;

    //     } catch (err) {
    //         return res.status(400).json({
    //             success: false,
    //             message: "Error adding Card.",
    //             error: err.message
    //         })
    //     }
    // },

    addCard: async (req, res) => {
        try {
            const { userId, paymentMethodId } = req.body;

            if (!userId || !paymentMethodId) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields."
                });
            }

            const findUser = await db.users.findOne({ _id: userId, isDeleted: false });
            if (!findUser) {
                return res.status(400).json({
                    success: false,
                    message: "User not found."
                });
            }
            const findPrimarCard = await db.cards.find({
                userId: findUser._id,
                status: 'active',
                isDeleted: false,
                isPrimary: true
            })
            let isPrimary;
            if (findPrimarCard.length > 0) {
                isPrimary = false;
            } else {
                isPrimary = true
            };

            let customerId = findUser.customerId;

            if (!customerId) {
                const customer = await stripe.customers.create({
                    email: findUser.email,
                    name: findUser.fullName,
                });
                customerId = customer.id;
                await db.users.findByIdAndUpdate(userId, { customerId });
            }

            console.log(customerId, "--------------------------------------------");

            await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

            const cardDetails = await stripe.paymentMethods.retrieve(paymentMethodId);

            const newCard = await db.cards.create({
                cardId: paymentMethodId,
                userId,
                country: findUser.country,
                fullName: findUser.fullName,
                last4: cardDetails.card.last4,
                brand: cardDetails.card.brand,
                exp_month: cardDetails.card.exp_month,
                exp_year: cardDetails.card.exp_year,
                paymentMethod: "stripe",
                isPrimary: isPrimary,
                status: "active",
            });

            return res.status(200).json({
                success: true,
                message: "Card added successfully.",
                cardId: newCard.cardId,
            });

        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error adding card.",
                error: err.message
            });
        }
    },

    // deleteCard: async (req, res) => {
    //     try {
    //         const { userId, cardId } = req.body;

    //         if (!userId || !cardId) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "Missing required parameters."
    //             });
    //         }

    //         let user = await db.users.findOne({ _id: userId, isDeleted: false });

    //         if (!user) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "User not found."
    //             });
    //         }

    //         let customerId = user.customerId;

    //         if (!customerId) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "Stripe customer not found for user."
    //             });
    //         }

    //         let card = await db.cards.findOne({
    //             userId,
    //             cardId,
    //             isDeleted: false
    //         });

    //         if (!card) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "Card not found."
    //             });
    //         }

    //         await stripe.paymentMethods.detach(cardId);

    //         await db.cards.updateOne(
    //             { userId, cardId },
    //             { isDeleted: true, isPrimary: false }
    //         );

    //         if (card.isPrimary) {
    //             let newPrimaryCard = await db.cards.findOne({
    //                 userId,
    //                 isDeleted: false
    //             }).sort({ createdAt: -1 });

    //             if (newPrimaryCard) {
    //                 await db.cards.updateOne(
    //                     { _id: newPrimaryCard._id },
    //                     { isPrimary: true }
    //                 );
    //             }
    //         }

    //         return res.status(200).json({
    //             success: true,
    //             message: "Card deleted successfully."
    //         });

    //     } catch (err) {
    //         return res.status(500).json({
    //             success: false,
    //             message: "Error deleting card.",
    //             error: err.message
    //         });
    //     }
    // },


    deleteCard: async (req, res) => {
        try {
            const { userId, cardId } = req.body;

            if (!userId || !cardId) {
                return res.status(400).json({ success: false, message: "Missing required fields." });
            }

            const findCard = await db.cards.findOne({ userId, cardId, isDeleted: false });

            if (!findCard) {
                return res.status(400).json({ success: false, message: "Card not found." });
            }

            const primaryCardCount = await db.cards.countDocuments({ userId, isPrimary: true, isDeleted: false });

            if (findCard.isPrimary && primaryCardCount === 1) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete the primary card without setting another primary card.",
                });
            }

            const paymentMethod = await stripe.paymentMethods.retrieve(cardId);

            if (paymentMethod.customer) {
                await stripe.paymentMethods.detach(cardId);
            } else {
                console.log("Card is not attached to a customer, skipping detachment.");
            }

            await db.cards.findByIdAndUpdate(findCard._id, { isDeleted: true });

            return res.status(200).json({
                success: true,
                message: "Card deleted successfully.",
            });

        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error adding card.",
                error: err.message
            });
        }
    },

    cardDetails: async (req, res) => {
        try {
            const cardId = req.query.id;
            const findCard = await db.cards.findOne({ _id: cardId, isDeleted: false });
            if (!findCard) {
                return res.status(400).json({
                    success: false,
                    message: "Card not found.",
                })
            }
            return res.status(200).json({
                success: true,
                message: "Card Details fetched successfully.",
                data: findCard,
            })
        }
        catch (err) {
            return res.status(400).json({
                success: false,
                message: "Error fetching Card details.",
                error: err.message
            })
        }
    },
    listCards: async (req, res) => {
        try {
            const { page = 1, limit = 10, search = '', userId } = req.query;

            let query = {
                isDeleted: false
            };
            query.userId = userId;
            if (search) {
                query.$or = [
                    { last4: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { country: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;

            const cards = await db.cards.find(query)
                .limit(Number(limit))
                .skip(Number(skip))
                .populate('userId', 'fullName email');

            const total = await db.cards.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: cards,
                total,
                page,
                limit
            });
        } catch (err) {
            return res.status(400).json({
                success: false,
                message: "Error fetching Card list for the user.",
                error: err.message
            })
        }
    },
    statusChange: async (req, res) => {
        try {
            let userId = req.body.userId;
            const id = req.body.id;
            if (!userId || !id) {
                return res.status(400).json({ success: false, message: 'userId and id are required' });
            }
            let findCard = await db.cards.findOne({ _id: id, isDeleted: false });
            if (!findCard) {
                return res.status(500).json({
                    success: false,
                    message: "Card not found."
                })
            }
            const updateAll = await db.cards.updateMany({ userId: userId }, { $set: { isPrimary: false } });

            const updatedCard = await db.cards.findOneAndUpdate(
                { _id: id, userId: userId, isDeleted: false },
                { $set: { isPrimary: true } },
                { new: true }
            );
            return res.status(200).json({
                success: true,
                data: updatedCard.cardId,
                message: 'Primary card updated successfully'
            });
        }
        catch (err) {
            console.log("ERROR:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to change the card status."
            })
        }
    }
}