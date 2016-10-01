; (function () {
  'use strict'

//  var dbuser = new PouchDB('http://xxxxxx:xxxxxx@localhost:5984/users')
  var dbuser = new PouchDB('users')
  PouchDB.debug.enable('pouchdb:find');
  /*
  dbuser.find({
    selector: {
      "_id": { "$gt": null },
      //"Username": { "$regex": "^d" }
    }
  }).then(function (r) {
    console.log('Found:', r.docs);
  })
  */
  dbuser.changes({
    since: 'now',
    live: true
  }).on('change', refreshUsers)

  var roles = [{
    Name: '',
    Id: 0
  }, {
      Name: 'User',
      Id: 3
    }, {
      Name: 'Admin',
      Id: 2
    }, {
      Name: 'Superadmin',
      Id: 1
    }]
  var users = []
  $('#txt-role').find('option').remove();
  roles.map(function (role) {
    $('#txt-role').append('<option id="' + role.Id + '" value="' + role.Id + '">' + role.Name + '</option>')
  })
  function refreshUsers(filter) {
    /*
    dbuser.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      var json = JSON.parse(JSON.stringify(result.rows))
      console.log(json);
      users = [];
      for (var d in json) {
        users.push(json[d].doc)
      }
      //$('#jsGrid').jsGrid('loadData');
    }).catch(function (err) {
      console.log(err)
    })
    */
    // console.log(res)
    /*
    dbuser.find({
      selector: {
        "_id": { "$gt": null },
        //"Username": { "$regex": "^d" }
      }
    }).then(function (r) {
      console.log('Found:', r);
      users = [];
      for (var d in r.docs) {
        users.push(r.docs[d])
      }
      //$('#jsGrid').jsGrid('loadData');
    })
    */
    //console.log(users)
    // return res
  }
  
  //refreshUsers()
  $('#jsGrid').jsGrid({
    width: '100%',
    height: '400px',

    //inserting: true,
    filtering: true,
    editing: true,
    sorting: true,
    paging: true,
    rowClick: function (args) {
      showDetailsDialog('Edit', args.item)
    },
    autoload: true,

    // data: clients,

    controller: {
      loadData: function (filter) {
        var d = $.Deferred();
        dbuser.find({
          selector: {
            "_id": { "$gt": null },
            "Username": { "$regex": filter.Username }
          }
        }).then(function (r) {
          d.resolve(r.docs);
          //$('#jsGrid').jsGrid('loadData');
        })

        return d.promise();
        //console.log('Refresh',filter.Username);
        //refreshUsers(filter);
        //return users
      },
      insertItem: function (item) {
        dbuser.post(item)
      },
      updateItem: function (item) {
        dbuser.get(item._id).then(function (doc) {
          return dbuser.put(item);
        }).then(function (response) {
          // handle response
        }).catch(function (err) {
          console.log(err);
        });
      },
      deleteItem: function (item) {
      }
    },

    fields: [{
      name: 'Username',
      type: 'text',
      width: 150,
      validate: 'required'
    }, {
        name: 'Password',
        type: 'text',
        width: 50
      }, {
        name: 'Role',
        type: 'select',
        items: roles,
        valueField: 'Id',
        textField: 'Name'
      }, {
        name: 'Married',
        type: 'checkbox',
        title: 'Is Married',
        sorting: false
      }, {
        type: 'control',
        modeSwitchButton: false,
        editButton: false,
        headerTemplate: function () {
          return $("<button>").attr("type", "button").text("Add")
            .on("click", function () {
              showDetailsDialog("Add", {});
            });
        }
      }]
  })
  var formSubmitHandler = $.noop
  var showDetailsDialog = function (dialogType, client) {
    $('#detailsForm').get(0).reset()
    $.each(client, function (key, value) {
      $('input[name=' + key + ']').val(value)
      //  console.log(value)
    })

    formSubmitHandler = function () {
      saveClient(client, dialogType === 'Add')
    }
    $("select#txt-role").val(client.Role);
    $('#detailsDialog').modal('show')
  }
  var saveClient = function (client, isNew) {
    $.extend(client, {
      Username: $("#txt-username").val(),
      Password: $("#txt-password").val(),
      Role: parseInt($("#txt-role").val(), 10)
      //$("select#txt-role").val()
    });
    $('#jsGrid').jsGrid(isNew ? 'insertItem' : 'updateItem', client)
    $('#detailsDialog').modal('hide')
  }
  $('#detailsForm').on('submit', function (event) {
    event.preventDefault()
    var objData = $(this).serializeArray()
    var data = []
    objData.forEach(function (user) {
      data[user.name] = user.value
    })
    //        console.log(data)
    formSubmitHandler()

    $('#basic').modal('hide')
  })

})()
