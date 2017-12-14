var socket = io();
const maxHistory = 16;
Chart.defaults.global.legend.display = false;



// Master meta config
var peers = {};

var peerTemplate = {
  "el": "#peers",
  "template":  `<div id='peer-wrapper'>      
     <peer v-for='peer in peers' :key='peer.address' v-bind:state=peer></peer>
  </div>   `,
   data : {
       peers: [    
      ]
   }

};
var vm = new Vue(peerTemplate);     



var systemTemplate = {
  "el": "#systeminfo",
  "template":  `<div id='systemInfo'> 
  
  <div class="row-col  light-blue-500  m-b-lg">
	<div class="col-xs-4">
		<div class="p-a-md">
			<h5>IRI Version </h5><h3 class="_700 m-y">  {{nodeInfo.appVersion}} 	</h3> 
			<h5 class="_500">Neighbours</h5> <div class="h3 _700 m-y"> 	 {{nodeInfo.neighbors}}  &nbsp; <a v-on:click="showNeighbors"> <span class="h5">Show List</span> </a></div>	
			<h5>Add a new Peer</h5>
			
			<div class="row">

			<div class="col-lg-9">
			 <input type="text" v-model="address" placeholder="E.g. udp://11.22.33.44:18400" class="form-control">
			 </div>
			 <div class="col-lg-3">
			  <button type="button" v-on:click="addPeer" class="btn btn-success">Add Peer</button>
			 </div>
			 </div>
		</div>
	</div>
    <div class="col-xs-8 dker">


                <div class="p-a-md">
                    	<h5>Latest Milestone Index: </h5><h3 class="_700 m-y">  {{nodeInfo.latestMilestoneIndex}} <span class="h6">({{nodeInfo.latestMilestone}})</span>	</h3> 
                    	<h5>Latest Solid Milestone Index: </h5><h3 class="_700 m-y">  {{nodeInfo.latestSolidSubtangleMilestoneIndex}} <span class="h6">({{nodeInfo.latestSolidSubtangleMilestone}})</span>	</h3> 
            			<div class="h5">
                			<strong>Tips:</strong>
            				{{nodeInfo.tips}} 
            			</div>		
            			<div class="h5">
                			<strong>Transactions to Request:</strong>
            				{{nodeInfo.transactionsToRequest}} 
            			</div>	
			

        </div>
	</div>

    </div>

  </div>
  `,
   "data" : {
      address: "",
      nodeInfo : {
      appName: 'IRI Testnet',
      appVersion: '1.1.3.10',
      jreAvailableProcessors: 2,
      jreFreeMemory: 8948256,
      jreVersion: '1.8.0_131',
      jreMaxMemory: 921174016,
      jreTotalMemory: 205520896,
      latestMilestone: 'SWDRPWLUPTGYBD9XRFMPAPBHHYZPWVYBGWOMPZLMWCAVJPMIKLPFBLXQ9CCTLPGDZNLJLQAVAAKL99999',
      latestMilestoneIndex: 74824,
      latestSolidSubtangleMilestone: '999999999999999999999999999999999999999999999999999999999999999999999999999999999',
      latestSolidSubtangleMilestoneIndex: 0,
      neighbors: 10,
      packetsQueueSize: 0,
      time: 1499089430275,
      tips: 2316,
      transactionsToRequest: 4549,
      duration: 0 }
   },
   methods: {
    addPeer: function (event) {
      // `this` inside methods points to the Vue instance
      //alert('Adding Peer ' + this.address + '!')
      // `event` is the native DOM event
      var normalizedAddress = this.address.replace(/\s/g, "");
      socket.emit('addPeer', { address: normalizedAddress });
    },
    showNeighbors: function (event){
        var n = "";
        vm.peers.forEach(function(peer){
           n +=  peer.connectionType + "://" + peer.address + "\n"; 
        });
        var  display = "<pre class='code-preview text-left p-a'>"+ n + "</pre>";
		swal({
		  title:"List of Neighbours",
		  html: display
		});
				

    }
  }      
};

var system = new Vue (systemTemplate);


var data = {}; 


socket.on('peerDeleted', function(info){
   debugger;
   var index = _.findIndex(vm.peers, function(obj){ return obj.address == info.address.split('//')[1]; });
   vm.peers.splice(index, 1);
   
});

socket.on('peerInfo', function(info){

   var item = _.find(vm.peers, function(obj){ return obj.address == info.address; });
    // { type: 'dio', state: { id: 0, status: true } }
    //if (item == undefined) item = vm[msg.type].state[0];
    if (item) {
    
     
        //info.address = undefined;
        var time = new Date();
        
        var seconds = time.getSeconds();
        var minutes = time.getMinutes();
        var hour = time.getHours();
        
        var obj = Object.assign({},item.history);
        obj.labels.push(""+hour+":"+minutes+":"+seconds);
        
        if ( obj.labels.length > maxHistory) obj.labels.shift();
        
        obj.datasets[0].data.push(info.numberOfAllTransactions - item.numberOfAllTransactions );
        if ( obj.datasets[0].data.length > maxHistory) obj.datasets[0].data.shift();
        
        obj.datasets[1].data.push(info.numberOfNewTransactions - item.numberOfNewTransactions);
        if ( obj.datasets[1].data.length > maxHistory) obj.datasets[1].data.shift();
        
        obj.datasets[2].data.push(info.numberOfSentTransactions - item.numberOfSentTransactions);
        if ( obj.datasets[2].data.length > maxHistory) obj.datasets[2].data.shift();

        Object.assign(item, info);
        
        Vue.set(item, "history", obj); 
        //debugger;
        
    }
    else{
        info.history = { 
          labels: [],
          datasets: [
            {
              label: 'Rec TX',
              borderColor: '#333',
              backgroundColor: 'rgba(0,0,0,0)',
              data: []
            },
            {
              label: 'New TX',
              borderColor: '#5cb85c',
              backgroundColor: 'rgba(0,0,0,0)',

              data: []
            },
            {
              label: 'Sent TX',
              borderColor: '#03a9f4',
              backgroundColor: 'rgba(0,0,0,0)',

              data: []
            },
            
          ]
        };
        
        vm.peers.push(Object.assign({},info));
        
    }
    vm.peers.sort(function(a, b) {
          return b.numberOfNewTransactions - a.numberOfNewTransactions;
    });
    

});


socket.on('nodeInfo', function(info){
 system.nodeInfo = info;
});

socket.on('result', function(info){

swal('Response',
   info,
  'info'
);

});
