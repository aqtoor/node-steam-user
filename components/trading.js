var Steam = require('steam');
var SteamUser = require('../index.js');
var SteamID = require('steamid');

SteamUser.prototype.trade = function(steamID) {
	if(typeof steamID === 'string') {
		steamID = new SteamID(steamID);
	}

	this._send(Steam.EMsg.EconTrading_InitiateTradeRequest, {"other_steamid": steamID.getSteamID64()});
};

SteamUser.prototype.cancelTradeRequest = function(steamID) {
	if(typeof steamID === 'string') {
		steamID = new SteamID(steamID);
	}

	this._send(Steam.EMsg.EconTrading_CancelTradeRequest, {"other_steamid": steamID.getSteamID64()});
};

// Handlers

SteamUser.prototype._handlers[Steam.EMsg.EconTrading_InitiateTradeProposed] = function(body) {
	var self = this;
	this.emit('tradeRequest', new SteamID(body.other_steamid.toString()), function(accept) {
		self._send(Steam.EMsg.EconTrading_InitiateTradeResponse, {
			"trade_request_id": body.trade_request_id,
			"response": accept ? Steam.EEconTradeResponse.Accepted : Steam.EEconTradeResponse.Declined
		});
	});
};

SteamUser.prototype._handlers[Steam.EMsg.EconTrading_InitiateTradeResult] = function(body) {
	// Is trade ID meaningful here?
	this.emit('tradeResponse', new SteamID(body.other_steamid.toString()), body.response, {
		"steamguardRequiredDays": body.steamguard_required_days,
		"newDeviceCooldownDays": body.new_device_cooldown_days,
		"defaultPasswordResetProbationDays": body.default_password_reset_probation_days,
		"passwordResetProbationDays": body.password_reset_probation_days,
		"defaultEmailChangeProbationDays": body.default_email_change_probation_days,
		"emailChangeProbationDays": body.email_change_probation_days
	});
};

SteamUser.prototype._handlers[Steam.EMsg.EconTrading_StartSession] = function(body) {
	this.emit('tradeStarted', new SteamID(body.other_steamid.toString()));
};
