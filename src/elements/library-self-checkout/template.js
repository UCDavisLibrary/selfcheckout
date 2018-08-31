export default /* @html */`

<div id="header">
    <div id="logo-main">
        <img class= "logo-img" src="assets/ucd-logo-main-new-white.png" alt="Library Logo">
    </div>
    <div id="header-text">
        <h1>Self Checkout<h1>
    </div>
</div>
    <iron-ajax
        id="ajax_user"
        url="https://api-na.hosted.exlibrisgroup.com/almaws/v1/users"
        handle-as="json"
        rejectWithRequest
        debounce-duration="300">
    </iron-ajax>
    <iron-ajax
        id="ajax_user_full"
        handle-as="json"
        rejectWithRequest
        debounce-duration="300">
    </iron-ajax>
    <iron-ajax
        id="ajax_user_loans"
        handle-as="json"
        rejectWithRequest
        debounce-duration="300">
    </iron-ajax>
    <iron-ajax
        id="ajax_checkout"
        handle-as="json"
        method="POST"
        rejectWithRequest
        debounce-duration="300">
    </iron-ajax>
<div id="body">
    <div id="cardreader_cont">
        <h2 style="color:#fff">Swipe Student ID Card or Enter ID</h2>
    <iron-input id="cardreader"
                allowed-pattern="[0-9]"
                bind-value={{BindValue}}
                auto-validate>
        <input value="{{BindValue::input}}">
    </iron-input>
</div>
    </div>
    <paper-dialog id="details_window"
                  entry-animation="scale-up-animation"
                  exit-animation="fade-out-animation"
                  no-cancel-on-outside-click
                  with-backdrop>
        <div id="details_header">
            <div>
                <h2>Welcome {{user_name}}</h2>
            </div>
            <div id= "button_logout_div">
                <paper-icon-button id= "button_logout"
                                   icon='exit-to-app'
                                   title="Finish and Logout"
                                   on-click='logout_user'>
                </paper-icon-button>
            </div>
        </div>



        <iron-input id="barcode"
                    bind-value={{bcValue}}
                    auto-validate>
            <input value="{{bcValue::input}}" placeholder="Scan or Enter Barcode Located on the Back Inside Cover of Item">
        </iron-input>

        <h3>Your Loans ({{user_loan_count}})</h3>
            <paper-dialog-scrollable id = "loan_scroll">
                <div id="loan_table">
                    <div class="loan_row loan_header">
                        <div class="loan_cell" style="width:85%;">Loan</div>
                        <div class="loan_cell" style="width:15%;">Due Date</div>
                    </div>
                    <template is="dom-repeat" items = "[[user_loans]]" as= "loan">
                        <div class="loan_row" id$=[[loan.animation]] loanid$={{loan.loan_id}}>
                            <div class="loan_cell">
                                <span class="loan_title">{{loan.title}}</span><br />
                                <span class="loan_author">{{loan.author}}</span><br />
                                <span class="loan_date">Checked out:
                                    <span class$="{{loan.ld_class}}">{{_format_loan_date(loan.loan_date)}}</span>
                                </span>
                            </div>
                            <div class="loan_cell">{{_format_due_date(loan.due_date)}}</div>

                        </div>
                    </template>
                </div>

            </paper-dialog-scrollable>
            <div id="loan_none">You have no active loans</div>
        <div id="details_footer"></div>
    </paper-dialog>
    <paper-dialog id="progress_cont" always-on-top with-backdrop>
        <div style="margin-top:inherit;padding:0px 10px 0px 0px;">
        <paper-spinner id="progress_spin"></paper-spinner>
        </div>
        <span id="progress_text" style="padding:0px;">Loading...</span>
    </paper-dialog>
    <paper-toast id="pt-red-body"
                 class="fit-bottom pt-red"
                 text="Error!"
                 duration=5000>
    </paper-toast>
    <paper-toast id="pt-red-details"
                 class="fit-bottom pt-red"
                 text="Error!"
                 duration=5000>
    </paper-toast>
    <paper-toast id="pt-green-details"
                 class="fit-bottom pt-green"
                 text="Success!"
                 duration=5000>
    </paper-toast>
    <paper-toast id="pt-green-body"
                 class="fit-bottom pt-green"
                 text="Success!"
                 duration=5000>
    </paper-toast>


`
