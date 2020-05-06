module.exports = function (email, password) {
    let html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css?family=Parisienne&display=swap" rel="stylesheet">
        <title>G-List</title>
    </head>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: block;
            background: #F9FCFF;
        }
    
        .header {
            position: fixed;
            top: 0;
            width: 100%;
            height: 10vh;
            margin: 0 auto;
            font-family: 'Parisienne', cursive, sans-serif;
            text-align: center;
            background: #3C91E6;
            color: #F9FCFF;
        }
    
        .header-text {
            height: 10vh;
            line-height: 10vh;
            font-size: 8vh;
            margin: 0;
            padding: 0;
        }
    
        .content {
            position: fixed;
            top: 10%;
            width: 100%;
            overflow: scroll;
            height: 75vh;
            font-family: sans-serif;
            padding: 2.5% 0;
        }
    
        .inner-content {
            width: 75%;
            margin-left: 12.5%;
            height: auto;
            overflow: scroll;
            border-radius: 8px;
        }
    
        .invite-header {
            height: 32px;
            line-height: 32px;
            font-size: 24px;
            text-align: center;
            text-transform: capitalize;
            color: #3C91E6;
            margin-bottom: 32px;
            padding: 2%;
        }
    
        .invite-message {
            height: auto;
            text-align: center;
            padding: 2%;
            line-height: 16px;
            color: #2F3338;
        }
    
        .invite-button {
            height: 32px;
            line-height: 32px;
            font-size: 16px;
            display: block;
            width: 50%;
            text-align: center;
            border-radius: 8px;
            margin: 0 auto;
            color: #F9FCFF;
            background: #3C91E6;
            text-transform: capitalize;
            text-decoration: none;
            transition: 0.3s;
        }
    
        .invite-button:hover {
            color: #3C91E6;
            background: #F9FCFF;
        }
    
        .footer {
            position: fixed;
            top: 90%;
            width: 100%;
            height: 10vh;
            line-height: 10vh;
            font-family: sans-serif;
            background: #3C91E6;
            color: #F9FCFF;
        }
    </style>
    
    <body style="margin: 0;padding: 0;display: block;background: #F9FCFF;">
        <div class="header" style="position: fixed;top: 0;width: 100%;height: 10vh;margin: 0 auto;font-family: 'Parisienne', cursive, sans-serif;text-align: center;background: #3C91E6;color: #F9FCFF;">
            <h1 class="header-text" style="height: 10vh;line-height: 10vh;font-size: 8vh;margin: 0;padding: 0;">G-List</h1>
        </div>
        <div class="content" style="position: fixed;top: 10%;width: 100%;overflow: scroll;height: 75vh;font-family: sans-serif;padding: 2.5% 0;">
            <div class="inner-content" style="width: 75%;margin-left: 12.5%;height: auto;overflow: scroll;border-radius: 8px;">
                <div class="invite-message" style="height: auto;text-align: center;padding: 2%;line-height: 16px;color: #2F3338;">
                    Someone requested to reset the password for ${email}.  If that was you, copy and paste the password below below:
                </div>
                <div class="invite-message" style="height: auto;text-align: center;padding: 2%;line-height: 16px;color: #2F3338;">
                Here is your new password: ${password}
                </div>
                <a href="https://g-list-cb.herokuapp.com/reset" class="invite-button" style="height: 32px;line-height: 32px;font-size: 16px;display: block;width: 50%;text-align: center;border-radius: 8px;margin: 0 auto;color: #F9FCFF;background: #3C91E6;text-transform: capitalize;text-decoration: none;transition: 0.3s;">
                    Reset
                </a>
                <div class="invite-message" style="height: auto;text-align: center;padding: 2%;line-height: 16px;color: #2F3338;">
                    If you didn't, just ignore this email &#128134;
                </div>
            </div>
        </div>
        <footer class="footer" style="position: fixed;top: 90%;width: 100%;height: 10vh;line-height: 10vh;font-family: sans-serif;background: #3C91E6;color: #F9FCFF;">
    
        </footer>
    </body>
    
    </html>`;
    return html;
}