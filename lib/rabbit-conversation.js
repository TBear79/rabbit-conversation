'use strict'

const amqplib = require('amqplib');
const uuid = require('node-uuid');
const rabbitChatter = require('rabbit-chatter');
const rabbitListener = require('rabbit-listener');


class RabbitConversation{
	constructor(options){

		if(!options)
			options = {};

		//set chatter and listener here
		this._chatter = rabbitChatter.rabbit(options);
		this._listener = rabbitListener.rabbit(options);
	}

	static rabbit(options){
		return new RabbitConversation(options);
	}

	start(msg, properties, callback){
		const t = this;

		if(typeof properties == "function"){
			callback = properties;
			properties = null;
		}

		properties = properties || {};
		properties.replyToQueue = properties.replyToQueue || uuid.v4();
		t.chatAndListen(msg, properties, callback);
	}

	chatAndListen(msg, properties, callback){
		const t = this;
		
		//Start listening before chatting
		//t._listener.listen((replyMsg) => { console.log("HEARD REPLY"); callback(replyMsg); });

		t._chatter.chat(msg, properties, () => {
			
		});
	}
}

module.exports= RabbitConversation;
