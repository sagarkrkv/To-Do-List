var entry_table = [];
var entry_id = 1;
 $(document).ready(function() {

     //Initialize an array to store the entries
     

     var table = document.querySelector('table');
     var headerCheckbox = table.querySelector('thead .mdl-data-table__select input');

     $("table").hide();


     // function called when a new entry is made

     $('form').submit(function(event) {

         var x = $('input[name=input_text]').val();

         if (x == " ") {
             alert("Input must be non-empty");
             return false;
         }

         for (var e in entry_table) {
             if (x.toLowerCase() == entry_table[e]['entry'].toLowerCase()) {
                 alert(x + " already exists");
                 return false;
             }
         }

         var new_entry = {
             'input_text': x
         };

         $.ajax({
             type: 'POST',
             url: '/',
             data: new_entry,
             dataType: 'json',
             encode: true
         })

         // using the done promise callback
         .done(function(data) {
             // saving the json data in an array
             data['id'] = entry_id;
             entry_table.push(data);
             toast(data['entry'] + " added.");
             //calling the function to display data
             display_data();
             entry_id += 1;

             $("table").show();

         });

         // reseting the form to clear the input text
         $("form").trigger("reset");

         // stop the html default form submit action
         event.preventDefault();

         // toast("Entry #"+ (entry_table.length+1));

         //removing the check mark for the whole table
         uncheck_Header();
         // var uncheckHeader = table.querySelector('thead .mdl-data-table__select');
         // uncheckHeader.MaterialCheckbox.uncheck();

     });


     // Function to diplay all the entries
     function display_data() {
         var h = '';
         for (var e in entry_table) {
             h += '<tr>' +
                 '<td>' +
                 '<label class="mdl-checkbox mdl-js-checkbox md-js-ripple-effect mdl-data-table__select" for=' + entry_table[e]['id'] + '>' +
                 '<input type="checkbox" id=' + entry_table[e]['id'] + ' class="mdl-checkbox__input" />' +
                 '<td class="mdl-data-table__cell--non-numeric">' +
                 entry_table[e]['entry'] +
                 '</td>' +
                 '<td>' +
                 entry_table[e]['time'] +
                 '</td>' +
                 '<td>' +
                 '<button type="button" id=' + entry_table[e]['id'] + ' class="button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect"><i class="material-icons">delete</i></button>' +
                 '</td>' +
                 '</tr>';

         }
         $('#entries').html(h);
         //refreshes the design on the newly added entries 
         componentHandler.upgradeAllRegistered();

         // call a function to update the checkbox
         update_checkboxes();
     }

     // Function to update the checkboxes
     function update_checkboxes() {
         var boxes = table.querySelectorAll('tbody .mdl-data-table__select');
         for (var i = 0, length = boxes.length; i < length; i++) {
             if (entry_table[i]['done'] == 1) {
                 boxes[i].MaterialCheckbox.check();
                 $(boxes[i]).parents().eq(1).css("text-decoration", "line-through");
             }
         }
     }

     // Function to sort the entries

     $('#headings th').click(function() {
         var id = $(this).attr('id');
         var asc = (!$(this).attr('asc')); // switch the order, true if not set

         // set asc="asc" when sorted in ascending order
         $('#headings th').each(function() {
             $(this).removeAttr('asc');
         });
         if (asc) $(this).attr('asc', 'asc');
         sortResults(id, asc);
     });

     function sortResults(prop, asc) {
         entry_table = entry_table.sort(function(a, b) {
             if (asc) {
                 var nameA = a[prop].toLowerCase(),
                     nameB = b[prop].toLowerCase()
                 if (nameA < nameB) //sort string ascending
                     return -1
                 if (nameA > nameB)
                     return 1
                 return 0
             } else {
                 var nameA = a[prop].toLowerCase(),
                     nameB = b[prop].toLowerCase()
                 if (nameA > nameB) //sort string descending
                     return -1
                 if (nameA < nameB)
                     return 1
                 return 0

             }
         });
         console.log(entry_table);
         // call to display data after sorting
         display_data();
     }



     // Delete the entry from the table
     function delete_elem(e_id) {

         for (var e in entry_table) {
             if (entry_table[e]['id'] == e_id) {
                 toast(entry_table[e]['entry'] + " Deleted");
                 entry_table.splice(e, 1);
             }
         }
         if (entry_table.length < 1) $("table").hide();
     }

     //Listener to detect delete button presses.

     $('#entries').on("click", ".button", function(em) {
         var f_id = $(em.target).attr('id');
         // console.log($(em.target).parents().eq(1));
         var e_id = $(em.target).parent().attr('id');
         // alert(e_id);
         // console.log("target");
         // console.log($(em.target));
         // console.log("e_id");

         // console.log(e_id);
         //Handling compatability issues with firefox and Edge 
         if (f_id > 0) {
             delete_elem(f_id);
             display_data();
         } else {
             // Call to remove the entry from the entry table
             delete_elem(e_id);
             //fades out the row being deleted
             $(em.target).parents().eq(2).fadeOut("normal", function() {
                 $(em.target).parents().eq(2).remove();
             });
         }



     });



     // function to check/uncheck all checkboxes when the checkbox in the heading is clicked

     var headerCheckHandler = function(event) {
         var boxes = table.querySelectorAll('tbody .mdl-data-table__select');
         if (event.target.checked) {

             for (var i = 0, length = boxes.length; i < length; i++) {
                 boxes[i].MaterialCheckbox.check();
                 $(boxes[i]).parents().eq(1).css("text-decoration", "line-through");

                 entry_table[i]['done'] = 1
             }
             toast("All entries completed");
         } else {
             for (var i = 0, length = boxes.length; i < length; i++) {
                 boxes[i].MaterialCheckbox.uncheck();
                 $(boxes[i]).parents().eq(1).css("text-decoration", "");
                 entry_table[i]['done'] = 0
             }
             toast("All entries incomplete");
         }
     };

     headerCheckbox.addEventListener('change', headerCheckHandler);


     // function to update the done/not done status when a box is checked

     $('#entries').on("click", ".mdl-checkbox__input", function(em) {
         var e_id = em.target.id;
         // console.log(e_id);
         var boxes = table.querySelectorAll('tbody .mdl-data-table__select');
         for (var e in entry_table) {
             if (entry_table[e]['id'] == e_id) {
                 if (entry_table[e]['done'] == 0) {
                     entry_table[e]['done'] = 1;
                     toast(entry_table[e]['entry'] + " completed");
                     $(boxes[e]).parents().eq(1).css("text-decoration", "line-through");

                 } else {
                     $(boxes[e]).parents().eq(1).css("text-decoration", "");
                     entry_table[e]['done'] = 0;
                     toast(entry_table[e]['entry'] + " incomplete");
                 }
             }
         }

         uncheck_Header();

     });

     function uncheck_Header() {
         var uncheckHeader = table.querySelector('thead .mdl-data-table__select');
         uncheckHeader.MaterialCheckbox.uncheck();
     }

     function toast(msg) {
         var snackbarContainer = document.querySelector('#toast');
         var outdata = {
             message: msg,
             timeout: 1200
         };
         snackbarContainer.MaterialSnackbar.showSnackbar(outdata);
     }

 });