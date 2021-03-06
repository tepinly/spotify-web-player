const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const cors = require("cors");
const lyricsFinder = require("lyrics-finder");

require('dotenv').config({path:'../.env'});
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/lyrics", async (req, res) => {
    const artist = req.query.artist.replace(/\s/g, "-");
    const track = req.query.track.replace(/\s/g, "-");
    const lyrics = await lyricsFinder(artist, track);
    res.json({ lyrics });
});

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken;
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.app_address,
        clientId: process.env.client_id,
        clientSecret: process.env.client_secret,
        refreshToken,
    });

    spotifyApi
        .refreshAccessToken()
        .then(data => {
            res.json({
                accessToken: data.body.accessToken,
                expiresIn: data.body.expiresIn,
            })
        })
        .catch(err => {
            res.sendStatus(400);
        });
});

app.post("/login", (req, res) => {
    const code = req.body.code;
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.app_address,
        clientId: process.env.client_id,
        clientSecret: process.env.client_secret,
    });

    spotifyApi
        .authorizationCodeGrant(code)
        .then((data) => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            });
        })
        .catch(() => {
            console.log(err);
            res.sendStatus(400);
        });
});

app.listen(process.env.server_port);
