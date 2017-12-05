var Template =`

      <div class="col-sm-3 min-h-500">   
         
        <section class="panel" v-bind:class="[deadPeer ? 'panel-danger' : 'panel-default']" > 
            <header class="panel-heading bg-light no-border"> 
                <div class="clearfix"> 
                <div class="clear"> 
                <a href="#" class="btn btn-xs btn-rounded btn-danger m-xs pull-right" v-on:click="removePeer">X</a>
              
               
                <input class="h5" v-model="state.tag" v-on:keyup.enter="editTag" v-bind:class="[updating ? '' : 'tag-disabled']" :disabled="updating == 1 ? false : true" v-bind:size="state.tag.length"> 

                <i v-on:click="editTag" v-bind:class="[updating ? 'fa fa-2x fa-check text-success' : 'fa fa-2x fa-pencil text-black-lt']"></i>

                <div class="text-info text-md">{{state.connectionType}}://{{state.address}}</div>
                
                </div> 
                </div> 
                </header> 
                 <div class="spark">
                 <canvas :id="id" width="200" height="180" ></canvas>
                 </div>
                
                <div class="list-group-alt no-radius">
            
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfSentTransactions}}</span>Sent Transactions</div>
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfAllTransactions}}</span>Received Transactions</div>
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfNewTransactions}}</span>Received New Transactions</div>
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfRandomTransactionRequests}}</span>Received Random Transaction Requests</div>
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfInvalidTransactions}}</span>Received Invalid Transactions</div>
                </div>
                </section>
        
       </div>
`;


var peer = Vue.component('peer', {
    
  props: ['state'],
  template: Template,
  data: function (){
    return {
       updating: false,
       id : this._uid
    };
  },
  computed: {
    deadPeer: function()
    {
       if (!this.state) return false;
       var data = this.state.history.datasets[0].data;
       if (data.length < 10) return false;
       return !_.without(data, data[0]).length;
    }
  },
  mounted () {
    //this.chartData.labels.push("");
    //this.chartData.datasets.data.push(1);
    //this.chartData = {};
    var ctx = document.getElementById(this._uid).getContext('2d');
    this.myChart = new Chart(ctx, {
    type: 'line',
    data: { 
              labels: [],
              datasets: [
                {
                  label: 'Rec TX',
              
                  data: []
                },
                {
                  label: 'New TX',
                
                  data: []
                },
                {
                  label: 'Sent TX',
              
                  data: []
                },
                
              ]
            },
    options: {
        responsive: true, maintainAspectRatio: false, lineTension: 0,
        scales:
        {
            xAxes: [{
                display: false
            }]
        },
        legend: {
            display: true,
            labels: {
              boxWidth :10
            }
        }        
        
      }
    });
  },
  watch: {
    // whenever question changes, this function will run
    'state.history': function (newData) {
      //Object.assign(this.chartData,newData);
      Object.assign(this.myChart.data,newData);
      
      this.myChart.update(); 
    },
    'state.tag': function (newData, oldData) {
      //Object.assign(this.chartData,newData);
      socket.emit('updateTag', { address: this.state.address, tag:newData });
    },
    
  },  
   methods: {
    editTag: function (event) {
      this.updating = !this.updating;
    },
 
    removePeer: function (event) {
      // `this` inside methods points to the Vue instance
    
      swal({
        title: 'Are you sure?',
        text: 'Removing Peer ' +  this.state.connectionType +"://"+this.state.address + '!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete peer!'
      }).then(function () {
        socket.emit('removePeer', { address: this.state.connectionType +"://"+this.state.address });
        swal(
          'Deleted!',
          'Your peer has been deleted. Please also update your IRI config file (if required)' ,
          'success'
        )
        //this.$destroy();
      }.bind(this))
    }  
   }
})




