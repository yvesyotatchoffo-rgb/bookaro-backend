const SmtpController = require("../controllers/SmtpController");
const dotenv = require("dotenv");
dotenv.config();

const { BACK_WEB_URL, FRONT_WEB_URL, ADMIN_WEB_URL } = process.env;

//sending owner auto invite email about a new interest
const propertyVisitRequest = (options) => {
   
    const { ownerEmail , propertyName , ownerName , buyerName , buyerEmail} = options;
    message = "";

    message += `<!DOCTYPE html>
<html>

<head>
    <title>Bookaroo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">

    <style>
        @media (max-width:767px) {
            .w-100 {
                width: 100%;
            }

            .fz-20 {
                font-size: 25px !important;
            }
        }
    </style>

</head>

<body style="font-family: 'Poppins', sans-serif; background:#fff;">
    <table width="100%" cellpadding:"0" cellspacing="0">
        <tbody>
            <tr>
                <td style="padding: 50px 20px;">
                    <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                    ;"
                        class="w-100">
                        <tr>
                            <td style="height:40px;">

                            </td>
                        </tr>
                   
                        <tr>
                            <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                <img src="${BACK_WEB_URL}/img/image-1728022466713-723.png"
                                style="width: 120px; margin: 0 auto;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 60px;">
                                <table width="100%;cellpadding:"0" cellspacing="0" ">
                                    <tr>
                                        <td style="border-bottom: 1px solid 
                            #E2E8F0; ">

                            </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center; padding-bottom: 10px; ">
                                <img src="${BACK_WEB_URL}/img/image-1728022760309-8794.png"
                                style="width: 340px; margin: 0 auto;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 60px;">
                                <table width="100%;cellpadding:"0" cellspacing="0" ">
                                    <tr>
                                        <td style="border-bottom: 1px solid 
                            #E2E8F0; ">

                            </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #976dd0; line-height: 24px;"
                                    class="fz-20">Dear ${ownerName},
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 0 25px 0;">
                                <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    We hope this message finds you well.
                                </p>
                                 <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    We would like to inform you that <span style="font-weight:600;">${buyerName}</span> shows his interest in <span style="font-weight:600;">${propertyName}</span> property and will visit it.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:60px;">
                                  <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    Best Regards,
                                </p>
                                 <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    Team Bookaro
                                </p>
                            </td>
                        </tr>
                       
                     
            
                   
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>

`;

    SmtpController.sendEmail(ownerEmail, `New Visit Request for ${propertyName}`, message);
};

//sending buyer auto invite email about a new interest
const buyerPropertyVisitRequest = (options) => {
   
    const { ownerEmail , propertyName , ownerName , buyerName , buyerEmail} = options;
    message = "";

    message += `<!DOCTYPE html>
<html>

<head>
    <title>Bookaroo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">

    <style>
        @media (max-width:767px) {
            .w-100 {
                width: 100%;
            }

            .fz-20 {
                font-size: 25px !important;
            }
        }
    </style>

</head>

<body style="font-family: 'Poppins', sans-serif; background:#fff;">
    <table width="100%" cellpadding:"0" cellspacing="0">
        <tbody>
            <tr>
                <td style="padding: 50px 20px;">
                    <table width="676px" cellpadding:"0" cellspacing="0" style="margin: 0 auto; background:#F2F5FF
                    ;"
                        class="w-100">
                        <tr>
                            <td style="height:40px;">

                            </td>
                        </tr>
                   
                        <tr>
                            <td style="text-align:center; padding-bottom: 10px; height: 50px;">
                                <img src="${BACK_WEB_URL}/img/image-1728022466713-723.png"
                                style="width: 120px; margin: 0 auto;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 60px;">
                                <table width="100%;cellpadding:"0" cellspacing="0" ">
                                    <tr>
                                        <td style="border-bottom: 1px solid 
                            #E2E8F0; ">

                            </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center; padding-bottom: 10px; ">
                                <img src="${BACK_WEB_URL}/img/image-1728022760309-8794.png"
                                style="width: 340px; margin: 0 auto;" />
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 60px;">
                                <table width="100%;cellpadding:"0" cellspacing="0" ">
                                    <tr>
                                        <td style="border-bottom: 1px solid 
                            #E2E8F0; ">

                            </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:22px; max-width: 400px; margin:0 auto; font-weight: 600; padding: 0 20px; color: #976dd0; line-height: 24px;"
                                    class="fz-20">Dear ${buyerName},
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 15px 0 25px 0;">
                                <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    We hope this message finds you well.
                                </p>
                                 <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    We would like to inform you that your interest has been accepted by <span style="font-weight:600;">${ownerName}</span> for property <span style="font-weight:600;">${propertyName}</span> and you are allowed to visit there.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:60px;">
                                  <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    Best Regards,
                                </p>
                                 <p
                                    style="font-size:16px; max-width: 400px; margin:0 auto; text-align: center; color: #6D6D6D; line-height: 25px; padding: 0 20px;">
                                    Team Bookaro
                                </p>
                            </td>
                        </tr>
                       
                     
            
                   
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>

`;

    SmtpController.sendEmail(buyerEmail, `New interest added for ${propertyName}`, message);
};

module.exports = {
    propertyVisitRequest,
    buyerPropertyVisitRequest
}