const express = require('express');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const cookieParser = require('cookie-parser');  
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require("./routes/maps.routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);
app.use('/api/captain', captainRoutes);
app.use('/api/captains', captainRoutes);
app.use('/captain', captainRoutes);
app.use('/captains', captainRoutes);
app.use('/api/maps', mapsRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
}); 

app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});


module.exports = app;
