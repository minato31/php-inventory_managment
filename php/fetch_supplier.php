<?php

    require_once 'db_connection.php';

    $query = 'SELECT * FROM suppliers';

    $result = mysqli_query($con, $query);

    $output = array('data' => array());

    //variable to store the number of the row in the datatable
    $i = 0;

    while( $row = mysqli_fetch_array($result)) {

        if($row['status'] == 1) {
            $status = '<span class="badge badge-success text-center">Active</span>';
        } else {
            $status = '<span class="badge badge-danger text-center">Inactive</span>';
        }


        $buttons = '
        <div class="btn-group">
            <button type="button" class="btn btn-info" data-toggle="modal" data-target="#modalEdit" onclick="openEditModal(' . $row['id'] . ',' . $i .')">
                <i class="fas fa-pencil-alt"></i>
            </button>
            <button type="button" class="btn btn-danger" onclick="remove(' . $row['id']. ')">
                <i class="fas fa-times"></i>
            </button>
        </div>';

        $i++;

        $output['data'][] = array(
            $row['name'],
            $row['cpf_cnpj'],
            $row['email'],
            $status,
            $buttons
        );
    }

    echo json_encode($output);

    $con->close();
?>