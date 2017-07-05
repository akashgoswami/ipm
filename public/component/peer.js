var Template =`

      <div class="col-md-3">   
         
        <section class="panel" v-bind:class="[deadPeer ? 'panel-danger' : 'panel-default']" > 
            <header class="panel-heading bg-light no-border"> 
                <div class="clearfix"> 
                <div class="clear"> 
                <a href="#" class="btn btn-xs btn-rounded btn-danger m-xs pull-right" v-on:click="removePeer">X</a>
               
                <div class="h5 m-t-xs m-b-xs m-r-xs"> {{state.connectionType}}://{{state.address}}
              
                </div> 

                </div> 
                </div> 
                </header> 
                 <div class="spark">
                 <canvas :id="id" width="200" height="180" ></canvas>
                 </div>
                
                <div class="list-group no-radius alt">
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfAllTransactions}}</span>Total Transactions  </div> 
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfNewTransactions}}</span> Random Transactions  </div> 
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfNewTransactions}}</span> New Transactions  </div> 
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfInvalidTransactions}}</span>Invalid Transactions  </div> 
                <div class="list-group-item" href="#"> <span class="badge bg-success">{{state.numberOfInvalidTransactions}}</span>Sent Transactions </div> 
                </div>
                </section>
        
       </div>
`;


var peer = Vue.component('peer', {
    
  props: ['state'],
  template: Template,
  data: function (){
    return {
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
                  label: 'All TX',
              
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
        responsive: true, maintainAspectRatio: false, lineTension: 0
      }
    });
  },
  watch: {
    // whenever question changes, this function will run
    'state.history': function (newData) {
      //Object.assign(this.chartData,newData);
      Object.assign(this.myChart.data,newData);
      
      this.myChart.update(); 
    }
  },  
   methods: {
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
          'Your peer has been deleted.',
          'success'
        )
        //this.$destroy();
      }.bind(this))
    }  
   }
})




