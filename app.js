require('dotenv').config();

var YoutubeTranscript = require('youtube-transcript');
const youtube = require('youtube-metadata-from-url');
const { transporter } = require('./mail');

const videoId = process.env.VIDEO_ID;
const reception = require( './reception.json' );

YoutubeTranscript.default.fetchTranscript(videoId).then( async (res) => {
    
    const text = res.map( (val, index) => {
        let itemText;

        if ( index !== 0 && index % 20 == 0 ) {
            itemText = '.<br><br>';
        } else if ( index % 5 == 0 ) {
            itemText = ' '+ val.text + '.<br>';
        } else {
            const str = val.text;
            const str2 = str.charAt(0).toUpperCase() + str.slice(1);
            itemText = ' ' + str2;
        }
        return itemText;
    } );

    const yt = await youtube.metadata(`https://www.youtube.com/watch?v=${videoId}`);

    const title = yt?.title;
    const image = `<img src="${yt?.thumbnail_url}" width="100%" alt="Example Image">`;

    const html = `
        <html style="text-align:justify">
            ${image}
            ${text.join('')}
        </html>
    `

    var mailOptions = {
        from    : process.env.EMAIL_SENDER,
        to      : reception.join( ',' ),
        subject : title,
        html    : html
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
});