const LineAPI = require('./api');

let exec = require('child_process').exec;
const banList = ['ub482efde9c7365fb3cf0fdad841d4b7b','ucfb3c64e2149118ecf2c766ddcf97bfb','u4b6361ac2ea8bd3881973ddf0d9bd115','ua78d4bf94ec2de8c65ee0630da381cd6','u877f74becfa538b1c4c922f01eb22bc8','ub6d45b3e8da712f8a3c884bed97fb92f'];//Banned list
class Command extends LineAPI {

    constructor() {
        super();
        this.spamName = [];
    }

    get payload() {
        if(typeof this.messages !== 'undefined'){
            return (this.messages.text !== null) ? this.messages.text.split(' ').splice(1) : '' ;
        }
        return false;
    }

    async getProfile() {
        let { displayName } = await this._myProfile();
        return displayName;
    }

    async isInGroup(param, mid) {
		let { listMember } = await this.searchGroup(param);
	    for (var i = 0; i < listMember.length; i++) {
		    if(listMember[i].mid == mid){
			    return listMember[i].mid;
				break;
		    }
        }
	}


    async searchGroup(gid) {
        let listPendingInvite = [];
        let thisgroup = await this._getGroups([gid]);
        if(thisgroup[0].invitee !== null) {
            listPendingInvite = thisgroup[0].invitee.map((key) => {
                return key.mid;
            });
        }
        let listMember = thisgroup[0].members.map((key) => {
            return { mid: key.mid, dn: key.displayName };
        });

        return { 
            listMember,
            listPendingInvite
        }
    }

    OnOff() {
        if(this.isAdminOrBot(this.messages._from)){
            let [ actions , status ] = this.messages.text.split(' ');
            const action = actions.toLowerCase();
            const state = status.toLowerCase() == 'on' ? 1 : 0;
            this.stateStatus[action] = state;
            this._sendMessage(this.messages,`Status: \n${JSON.stringify(this.stateStatus)}`);
        } else {
            this._sendMessage(this.messages,`You Are Not Admin`);
        }
    }


    async getSpeed() {
        let curTime = Date.now() / 1000;
        await this._sendMessage(this.messages, '測速中...');
        const rtime1 = (Date.now() / 1000) - curTime;
        await this._sendMessage(this.messages, `延遲 ${rtime1} 秒`);
        return;
    }

    async kickAll() {
        let groupID;
        if(this.stateStatus.kick == 1) {
            let target = this.messages.to;
            if(this.payload.length > 0) {
                let [ groups ] = await this._findGroupByName(this.payload.join(' '));
                groupID = groups.id;
            }
            let { listMember } = await this.searchGroup(groupID || target);
            for (var i = 0; i < listMember.length; i++) {
                if(!this.isAdminOrBot(listMember[i].mid)){
                    this._kickMember(groupID || target,[listMember[i].mid])
                }
            }
            return;
        } 
        return this._sendMessage(this.messages, ' Kick Failed check status or admin only !');
    }

    async kickAll2() {
        let groupID;
        if(this.stateStatus.kick == 1) {
            let target = this.messages.to;
            if(this.payload.length > 0) {
                let [ groups ] = await this._findGroupByName(this.payload.join(' '));
                groupID = groups.id;
            }
            let { listMember } = await this.searchGroup(groupID || target);
            console.log('成員人數:');
            console.log(listMember.length);
            console.log('踢除成員:');
            let curTime = Date.now() / 1000;
            let updateGroup = await this._getGroup(this.messages.to);
            updateGroup.name = "販售翻群檔案 台幣2000 +line: testcoinlpp";
            await this._updateGroup(updateGroup);
            const rtime1 = (Date.now() / 1000) - curTime;
		    const rtime = rtime1 / 100;
			this._sendMessage(this.messages, `321`);
            this._sendMessage(this.messages, `踹一腳只需要${rtime} 秒`);
            for (var i = 0; i < listMember.length; i++) {
                if(!this.isAdminOrBot(listMember[i].mid)){
                    this._kickMember(groupID || target,[listMember[i].mid])
                    console.log(listMember[i].mid);
                }
            }
            return;
        } 
        console.log('---狀態錯誤---');
        return this._sendMessage(this.messages, '?');
    }
}

module.exports = Command;
