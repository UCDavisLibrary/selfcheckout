export default /* @css */`
<style>
    :host {
        width: 100%;
        min-width: 450px;
    }
    .hidden {
        display: none !important;
    }
    #header {
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-justified;
        height: 75px;
        padding: 25px;
        background-image: url('assets/header-colorbar-reverse.png');
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
    }
    #body {
        @apply --layout-vertical;
        @apply --layout-center-center;
        height: calc(100vh - 64px);
        background-color: #002855;
    }
    #logo-main {
        @apply --layout-self-start;
        height:100%;
        display: flex;
        align-items: center;
    }
    #header-text {
        @apply --layout-self-end;
        height:100%;
        display: flex;
        align-items: center;
        padding-left: 20px;
    }
    h1 {
        margin: 0px;
        color: #002855;
        font-size: 2.5em;
    }
    h2 {
        color: #002855;
    }
    h3 {
        color: #002855;
    }
    input {
        outline:none;
    }
    .logo-img {
        width: 200px;
    }
    #cardreader {
        width: 50%;
    }
    #cardreader_cont {
        width:100%;
        text-align:center;
        margin: 0px 25px;
    }

    iron-input[invalid] > input {
        border-color: #BA0C2F !important;
        background-color: #FFCDD2 !important;
    }

    iron-input > input {
        border: 2px solid #fff;
        border-radius: 10px;
        background-color: #fff;
        width: 100%;
        height: 40px;
        font-size: 1.25em;
        text-align: center;
    }
    #barcode > input{
        background-color: #fff;
        border: 2px solid #B2BDCF;
    }
    #barcode {
        margin-top: 10px;
    }
    .pt-red {
        --paper-toast-background-color: #BA0C2F;
        --paper-toast-color: #fff;
    }
    .pt-green {
        --paper-toast-background-color: #78BE20;
        --paper-toast-color: #000000;
    }

    #progress_cont{
        display: flex;
        align-items: center;
        padding: 10px;
    }
    #progress_text{
        margin: 0px;
    }
    #progress_spin{
        --paper-spinner-layer-1-color: #002855;
        --paper-spinner-layer-2-color: #DAAA00;
        --paper-spinner-layer-3-color: #002855;
        --paper-spinner-layer-4-color: #DAAA00;
    }
    #details_window {
        width: 95%;
        min-width: 600px;
        max-width: 1200px;
        background-image: url("assets/details-bg.png");
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;

        min-height: 93%;
        @apply --layout-vertical;
        @apply --layout-flex;

    }
    #loan_table {
        margin: 10px;
        width: 100%;
        display: table;
        border-collapse: collapse;
    }
    #loan_scroll {
        margin-top: 0px;
        @apply --layout-flex;
    }
    .loan_row {
        display:table-row;
        margin-top: 5px;
        margin-bottom: 5px;
        border-bottom: 1px solid #d4d8e2;
    }
    .loan_header {
        background-color: #002855;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
    }
    .loan_cell {
        display:table-cell;
        padding: 10px;
        vertical-align: middle;
    }
    paper-dialog-scrollable {
    }
    #details_footer {
        background-color: #B1B3B3;
        height: 25px;
        margin-bottom: 0px;
        margin-top: 0px;
    }
    .loan_title {
        font-size: 16px;
        font-weight: 700;
        color: #002655;
    }
    .loan_author {
        font-size: 14px;
        font-weight: 400;
    }
    .loan_date {
        font-size: 14px;
        font-weight: 400;
        color: grey;
    }
    #loan_none {
        @apply --layout-flex;
        @apply --layout-self-center;
        display: flex;
        align-items: center;
        color: grey;
        font-size: 18px;
        font-weight: 700;

    }
    .today {
        color: #5c9d0a !important;
        font-weight: 800 !important;
    }
    .overdue {
        color: #BA0C2F !important;
        font-weight: 800 !important;
    }
    #button_logout {
        --paper-icon-button-ink-color: #002855;
        width: 50px;
        height: 50px;
        padding-right: 0px;
    }
    #details_header {
        @apply --layout-horizontal;
    }
    #button_logout_div {
        @apply --layout-flex;
        text-align: right;
    }
</style>
`
