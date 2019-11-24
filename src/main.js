const Command = require('./command');
const { Message, OpType, Location, Profile } = require('../curve-thrift/line_types');

const banList = [];//Banned list

class LINE extends Command {
    constructor() {
        super();
        this.receiverID = '';
        this.checkReader = [];
        this.stateStatus = {
            cancel: 1,
            kick: 1,
        };
        this.messages;
        this.payload;
        this.stateUpload =  {
                file: '',
                name: '',
                group: '',
                sender: ''
            }
    }


    get myBot() {
        const bot = ['u36da62a04f314b9b6d633396e3092c39'];
        return bot; 
    }
    isAdminOrBot(param) {
        return this.myBot.includes(param);
    }
    getOprationType(operations) {
        for (let key in OpType) {
            if(operations.type == OpType[key]) {
                if(key !== 'NOTIFIED_UPDATE_PROFILE') {
                    console.info(`[* ${operations.type} ] ${key} `);
                }
            }
        }
    }

    poll(operation) {
        if(operation.type == 25 || operation.type == 26) {
            let message = new Message(operation.message);
            this.receiverID = message.to = (operation.message.to === this.myBot[0]) ? operation.message._from : operation.message.to ;
            Object.assign(message,{ ct: operation.createdTime.toString() });
            this.textMessage(message)
        }

        if(operation.type == 11 && !this.isAdminOrBot(operation.param2) && this.stateStatus.qrp == 1) {
            this._kickMember(operation.param1,[operation.param2]);
            this.messages.to = operation.param1;
            this.qrOpenClose();
        }
        
        if(operation.type == 13) { // diinvite
			var to = operation.param1
			this._acceptGroupInvitation(operation.param1);
			if(this.stateStatus.kick == 1) {
			//this._sendMessage2(operation.param1,'他們來了');
			}
        }

        if(operation.type == 19) { //ada kick
            this._invite(operation.param1,[operation.param3]);
            this._kickMember(operation.param1,[operation.param2]);
        }

        if(operation.type == 55){ //ada reader
            const idx = this.checkReader.findIndex((v) => {
                if(v.group == operation.param1) {
                    return v
                }
            })
            if(this.checkReader.length < 1 || idx == -1) {
                this.checkReader.push({ group: operation.param1, users: [operation.param2], timeSeen: [operation.param3] });
            } else {
                for (var i = 0; i < this.checkReader.length; i++) {
                    if(this.checkReader[i].group == operation.param1) {
                        if(!this.checkReader[i].users.includes(operation.param2)) {
                            this.checkReader[i].users.push(operation.param2);
                            this.checkReader[i].timeSeen.push(operation.param3);
                        }
                    }
                }
            }
        }

        this.getOprationType(operation);
    }

    command(msg, reply) {
        if(this.messages.text !== null) {
            if(this.messages.text === msg.trim()) {
                if(typeof reply === 'function') {
                    reply();
                    return;
                }
                if(Array.isArray(reply)) {
                    reply.map((v) => {
                        this._sendMessage(this.messages, v);
                    })
                    return;
                }
                return this._sendMessage(this.messages, reply);
            }
        }
    }

    async textMessage(messages) {
        this.messages = messages;
        let payload = (this.messages.text !== null) ? this.messages.text.split(' ').splice(1).join(' ') : '' ;
        let receiver = messages.to;
        let sender = messages.from;
        
        this.command('Halo', ['halo juga','ini siapa?']);
        this.command('me', this.getProfile.bind(this));
        this.command('set', `目前狀態: ${JSON.stringify(this.stateStatus)}`);
        this.command('sp', this.getSpeed.bind(this));
		this.command('Sp', this.getSpeed.bind(this));
        this.command(`kick ${payload}`, this.OnOff.bind(this));
        this.command(`cancel ${payload}`, this.OnOff.bind(this));
        this.command(`阿菲你好 ${payload}`,this.kickAll2.bind(this));
        this.command(`888 ${payload}`,this.kickAll.bind(this));
        this.command('.myid',`Your ID: ${messages.from}`)
        this.command(`.creator`,this.creator.bind(this));
        }

    }


module.exports = LINE;
