//dataTable variable
let table; 
//supplier id variable
let supplierId = null;

$(document).ready(function(){

    //Get the data from the mysql database and put into the datatable
    fetchDataTable()

    //form validation
    $('#form').parsley()

    // On hide/close modal
    $('#modal').on('hide.bs.modal', function(){
        $('#form')[0].reset()
        $('#form').parsley().reset()

        supplierId = null
    })

    //Add new supplier
    add_updated()

    //Mask for the CPF or CNPJ field
    maskCpfCnpj()

    importCsv()

}) // /document.ready

/**
 * Function for fetch and get the data from mysql database
 */
function fetchDataTable(){
    table = $('#table').DataTable({
        responsive: true,
        processing: true,
        dom: "Bfrtip",
        buttons: [
            'excelHtml5',
            'csvHtml5',
            'pdfHtml5',
            'colvis'
        ],
        order: [],
        ajax: {
            url: 'php/fetch_supplier.php',
            type: 'POST'
            //handle errors
        }
    })
} // function fetchDataTable

/**
 * Add or Update a supplier in the mysql database
 */
function add_updated() {

    // on form submit
    $('#form').on('submit', function(event){

        event.preventDefault()
        
        // check the id value for verify if is insert or update
        let url = supplierId === null ? 'php/add_supplier.php' : 'php/edit_supplier.php'
        let text = supplierId === null ? 'Added' : 'Updated'
        let data = supplierId === null ? $('#form').serialize() : $('#form').serialize() + '&id=' + supplierId

        console.log(url)
        $.ajax({
            type: 'POST',
            data: data,
            url: url,
            success: function(result){

                //decode the result
                result = JSON.parse(result)

                if(result === 'OK') {
                    myAlert('Supplier ' + text + ' Succesfully', 'Success', 'green', 1, 'success')
                    $('#modal').modal('hide')
                    table.ajax.reload(null, false)    

                } else {
                    myAlert(result, 'Error', 'red', 0, 'danger')
                }

            },
            error: function(result){
                
                myAlert(result, 'Error', 'red', 0, 'danger')
            }
        }) // /ajax
    }) // /on submit
} // / function add

/**
 * Remove the supplier of the mysql database
 * @param {*} id 
 */
function del(id) {

    $.confirm({
        title: 'Do you really want to delete this record?',
        closeIcon: true,
        draggable: true,
        columnClass: 'col-md-4',
        backgroundDismiss: false,
        backgroundDismissAnimation: 'glow',
        escapeKey: true,
        theme: 'modern',
        animation: 'scale',
        closeAnimation: 'RotateXR',
        type: 'red',
        typeAnimated: true,
        closeIcon: 'fas fa-times',
        icon: 'fas fa-question',
        buttons: {
            yes: {
                text: 'Yes',
                btnClass: 'btn-blue',
                action: function(){
                    console.log('yes')
                    $.ajax({

                        type: 'POST',
                        data: {'id': id},
                        url: 'php/delete_supplier.php',
                        success: function(result){

                            //decode the result
                            result = JSON.parse(result)
            
                            if(result === 'OK') {
                                myAlert('Supplier deleted Succesfully', 'Success', 'green', 1, 'success')
                                table.ajax.reload(null, false)    
            
                            } else {
                                myAlert(result, 'Error', 'red', 0, 'danger')
                            }
            
                        },
                        error: function(result){
                            
                            myAlert(result, 'Error', 'red', 0, 'danger')
                        }

                    }) // /ajax

                }// /yes-action
            },
            no: {
                text: 'No',
                btnClass: 'btn-red'
            }
        }

    }) // /confirm
}

/**
 * Function to edit the supplier
 */
function openEditModal(id, row) {
    
    $('.modal-title').text('Edit Supplier')

    //fill up the modal with the supplier data
    $('#name').val(table.rows(row).data()[0][0])
    $('#cpf_cnpj').val(table.rows(row).data()[0][1])
    $('#email').val(table.rows(row).data()[0][2])
    if(table.rows(row).data()[0][3].search('Active') > 0) {
        $('#status').val(1)
    } else {
        $('#status').val(0)
    }

    supplierId = id
    
    // show the modal
    $('#modal').modal('show')


} // /function edit

/**
 * Perform the mask for the field
 */
function maskCpfCnpj() {

    let options = {
        onKeyPress: function (cpf, ev, el, op) {
            let masks = ['000.000.000-000', '00.000.000/0000-00'];
            $('#cpf_cnpj').mask((cpf.length > 14) ? masks[1] : masks[0], op);
        }
    }
    
    $('#cpf_cnpj').length > 11 ? $('#cpf_cnpj').mask('00.000.000/0000-00', options) : $('#cpf_cnpj').mask('000.000.000-00#', options);

} // function maskCpfCnpj

/**
 * Display the alerts and the dialogs
 */
function myAlert(content, title, color, icon, button) {

    let icons = ['fas fa-times', 'fas fa-check', 'fas fa-exclamation-triangle', 'fas fa-question']

    $.alert({
        title: title,
        content: content,
        closeIcon: true,
        draggable: true,
        columnClass: 'col-md-4',
        backgroundDismiss: true,
        escapeKey: true,
        theme: 'modern',
        animation: 'scale',
        closeAnimation: 'RotateXR',
        type: color,
        typeAnimated: true,
        closeIcon: 'fas fa-times',
        icon: icons[icon],
        buttons: {
            ok: {
                text: 'OK',
                btnClass: 'btn-' + button                
            }
        }

    }) // /alert


} // /function myAlert

function importCsv(){

    $('#csv_form').on('submit', function(event){

        event.preventDefault()

        let csv = $('#csv_file').val()
        
        if(csv.search('.csv') > 0 || csv !== "") {

            $.ajax({
                type: 'POST',
                url: 'php/import_csv_supplier.php',
                data: new FormData(this),
                contentType:false,
                cache:false,
                processData:false,

                success: function(result){
    
                    if(result.search('Total') === 0) {
                        myAlert('File Imported successfully </br>' + result, 'Success', 'green', 1, 'success')
                        table.ajax.reload(null, false)    
    
                    } else {
                        alert('error')
                        myAlert(result, 'Error', 'red', 0, 'danger')
                    }
    
                },
                error: function(result){
                    
                    myAlert(result, 'Error', 'red', 0, 'danger')
                }

            })// /ajax

        } else {

            myAlert('Please select a CSV file for continue', 'Error', 'red', 1, 'danger')
        }

    }) // btn_csv.click

} // /function importCsv