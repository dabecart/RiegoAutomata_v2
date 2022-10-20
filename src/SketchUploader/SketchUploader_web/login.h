#include "Arduino.h"

const char login_html[] PROGMEM = R"rawliteral(
    <form name='loginForm'>
        <table width='20%' bgcolor='A09F9F' align='center'>
            <tr>
                <td colspan=2>
                    <center><font size=4><b>Sketch Uploader</b></font></center>
                    <br>
                </td>
                <br>
                <br>
            </tr>
            <td>Username:</td>
            <td><input type='text' size=25 name='userid'><br></td>
            </tr>
            <br>
            <br>
            <tr>
                <td>Password:</td>
                <td><input type='Password' size=25 name='pwd'><br></td>
                <br>
                <br>
            </tr>
            <tr>
                <td><input type='submit' onclick='check(this.form)' value='Login'></td>
            </tr>
        </table>
    </form>

    <script>
        function check(form) {
            if(form.userid.value=='admin' && form.pwd.value=='admin') {
                location.assign('/serverIndex')
            } else {
                alert('Error Password or Username')/*displays error message*/
            }
        }
    </script>;
)rawliteral";