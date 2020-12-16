import getDisplayDate from '/js/shared/getDisplayDate.js';
import GetResponsiveInchInputBox from '/js/shared/GetResponsiveInchInputBox.jsx';
import MySuggestionBox from '/js/shared/MySuggestionBox.jsx';
/**
    * Return editable table; accepts CSS ; header is generated according to input or it default using name ;  please note, this module acts as a container; 
    * @param  props  
    * @param  {handler} props.button - optional, handler
    * @param  {object} props.data - required, the data in the format of array
    * @param  {string} props.[any].className - required, the CSS class of the element
    * @param  {number} props.key_seed - optional, if the react table cannot update, try to input this to force update react table by using unique key, however, performance may be affected
    * @param  {string} props.span.name - required, [span element] the name in the input data for mapping
    * @param  {string} props.span.on_change - required, [span element] on change handler of the cell (non-toggle)  
    * @param  {string} props.span.on_toggle_change - optional, [span element] on change handler of the toggle (toggle)
    * @param  {string} props.span.input_type - required, [span element] the input type for input inherit <input/> from HTML5 and customized select 
    * @param  {string} props.span.displayName - optional, [span element] the display word in the table header ; if no input, use the name 
    * @return - editable table
    */
export default class MyEditableTable extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.data != this.props.data || nextProps.data.length != this.props.data.length;
    }
    render() {
        //console.log("MyEditableTable");
        const { children } = this.props;
        var attributes_map = {};
        var button_map = {};
        var foot_map = {};
        let cellList;

        React.Children.forEach(children, child => {
            if (child.type === "button")
                button_map[child.props.children] = child.props;
            else if (child.type === "tfoot") {  
                if (child.props.children.length !== undefined)
                    child.props.children.forEach((item, idx) => { foot_map[item.props.name] = item.props.func });
                else
                    foot_map[child.props.children.props.name] = child.props.children.props.func;
            } 
            else
                attributes_map[child.props.name] = child.props;
        }); 
        var UI_elements = Object.keys(attributes_map);

        //map the display header 
        var mappedHeader = [];
        if (this.props.showHeader) {
            if (Object.keys(button_map).length > 0) mappedHeader.push("Action");
            UI_elements.forEach(e => {
                mappedHeader.push(attributes_map[e].displayName ? attributes_map[e].displayName : attributes_map[e].name);
            });
        }
        //ENH for react_table cannot update 
        let seedKey = this.props.key_seed ? this.props.key_seed : 0;

        //map each data cell
        cellList = this.props.data.map((aDataCell, dataRwNum) => {
            //map data with the UI display element ; only use the ordered UI elements;
            var mapped_UI_data_map = new Map();
            UI_elements.forEach(e => {
                mapped_UI_data_map.set([e], aDataCell[e]);
            });
            //get the UI element row from the data row
            return <tr key={dataRwNum}>
                {getMappedContent(mapped_UI_data_map, attributes_map, dataRwNum, aDataCell[this.props.item_uni_id], button_map, this.props.tableId, seedKey)}
            </tr>;
        });
        //prepare for the footer 
        let mappedFooter = {}; 
        if (this.props.showHeader ) {
            let btnLength = Object.keys(button_map).length;
            Object.keys(foot_map).forEach(i => { 
                let pos = UI_elements.findIndex(s => s == i) + btnLength;
                let tmpObj = { 'name': i, 'action': foot_map[i]};    
                tmpObj['position'] = this.props.showHeader ? pos++ : pos; 
                mappedFooter[i] = tmpObj;
            }); 
        }
        return (
            <table id="reactTable" >
                <thead><MyDynamicHeader header_list={mappedHeader} /></thead>
                <tbody>{cellList}</tbody>
                <tfoot>
                    <MySummativeFooter location_list={mappedFooter} data={this.props.data}
                        displayItems={UI_elements} isBtn={Object.keys(button_map).length > 0} />
                </tfoot>
            </table>
        );
    }
}
//UI element mapping
function getMappedContent(mapped_UI_data_map, attributes_map,relative_row_id, dataRwNum, button_map, tableID, seedKey) {
    var returnObj = [];
    var i = seedKey;
    // row manipulation  
    if (Object.keys(button_map).length > 0) {
        let btnList = Object.keys(button_map).map((buttonLstKey, k) => {
            let func = button_map[buttonLstKey].handler;
            return <button key={k} className={button_map[buttonLstKey].className} onClick={(e) => func(dataRwNum, e, tableID)}> {button_map[buttonLstKey].children} </button>;
        });
        returnObj.push(<td key={i}>{btnList}</td>);
        ++i;
    }
    //use the display data element only to get the input part of the data
    mapped_UI_data_map.forEach((dataCellValue, dataCellKey, map) => {
        const callBackFunc = attributes_map[dataCellKey].on_change ? attributes_map[dataCellKey].on_change : null;
        if (attributes_map[dataCellKey].input_type === "displayString") {
            if (String(attributes_map[dataCellKey].name).toLocaleLowerCase().includes("date") || String(attributes_map[dataCellKey].name).toLocaleLowerCase() === "dob")
                returnObj.push(<td key={i + seedKey}>{getDisplayDate(dataCellValue)}</td>);
            else if (attributes_map[dataCellKey].on_toggle_change)
                returnObj.push(<td key={i + seedKey}>{dataCellValue ? attributes_map[dataCellKey].positiveDisplay : attributes_map[dataCellKey].negativeDisplay}</td>);
            else
                returnObj.push(<td key={i + seedKey}>{dataCellValue}</td>);
        } else if (attributes_map[dataCellKey].input_type === "inchBox") { 
            returnObj.push(<td key={i + seedKey}>{
                <GetResponsiveInchInputBox
                    value={dataCellValue}
                    className={attributes_map[dataCellKey].className}
                    step={attributes_map[dataCellKey].step} stateHnadler={attributes_map[dataCellKey].on_change}
                    name={attributes_map[dataCellKey].name} tableName={tableID} rowID={dataRwNum}/>}
            </td>);
        } else if (attributes_map[dataCellKey].input_type === "suggBox") {
            returnObj.push(<td key={i + seedKey}>{
                <MySuggestionBox
                    value={dataCellValue} suggest_list_name={attributes_map[dataCellKey].suggest_list_name}
                    suggest_btn={attributes_map[dataCellKey].suggest_btn_list}
                    className={attributes_map[dataCellKey].className} relative_row_id={relative_row_id}
                    stateHnadler={attributes_map[dataCellKey].on_change}
                    name={attributes_map[dataCellKey].name} tableName={tableID} rowID={dataRwNum} />}
            </td>);
        } else {
            var attributesObj = {
                name: attributes_map[dataCellKey].name,
                className: attributes_map[dataCellKey].className,
                disabled: attributes_map[dataCellKey].isDisabled,
                style: attributes_map[dataCellKey].isHidden ? { display: "none" } : { display: "block" }
            };
            if (attributes_map[dataCellKey].input_type === "select") {
                attributesObj['defaultValue'] = dataCellValue ? dataCellValue : attributes_map[dataCellKey].default_value;
                attributesObj['onChange'] = function (e) { callBackFunc(dataRwNum, e, tableID) };
                let suggLst = String(attributes_map[dataCellKey].value_list).split(",");
                let listList = suggLst.map((suggestValue, suggKey) => <option value={suggestValue} key={suggKey}>{suggestValue}</option>);
                returnObj.push(<td key={i}>{React.createElement('select', attributesObj, listList)}</td>);
            }
            else {
                attributesObj['type'] = attributes_map[dataCellKey].input_type;
                if (attributes_map[dataCellKey].input_type === "checkbox") {
                    const callBackFuncToggle = attributes_map[dataCellKey].on_toggle_change;
                    attributesObj['defaultChecked'] = dataCellValue;
                    attributesObj['onChange'] = function (e) { callBackFuncToggle(dataRwNum, e, tableID) };
                } else if (attributes_map[dataCellKey].input_type === "number") {
                    attributesObj['defaultValue'] = dataCellValue;
                    attributesObj['onChange'] = function (e) { callBackFunc(dataRwNum, e, tableID) };
                    attributesObj['step'] = attributes_map[dataCellKey].step ? attributes_map[dataCellKey].step : 0;
                } else if (attributes_map[dataCellKey].input_type === "date") {
                    console.log(getDisplayDate(dataCellValue))
                    attributesObj['defaultValue'] = getDisplayDate(dataCellValue);
                    attributesObj['onChange'] = function (e) { callBackFunc(dataRwNum, e, tableID) };
                } else { 
                    attributesObj['defaultValue'] = dataCellValue;
                    attributesObj['onChange'] = function (e) { callBackFunc(dataRwNum, e, tableID) };
                }
                returnObj.push(<td key={i + seedKey}>{React.createElement('input', attributesObj)}</td>);
            }
        }
        ++i;
    });
    mapped_UI_data_map.clear()
    return returnObj;
}
function MyDynamicHeader(props) {
    return (<tr>{props.header_list.map((h, k) => <th key={k}> {h}</th>)}</tr>);
}
function MySummativeFooter(props) {
    let tmp = props.displayItems.map((h, k) => <td key={k}>&nbsp;</td>);
    if (props.isBtn) tmp.push(<td key={props.displayItems.length + 1}>&nbsp;</td>);
    Object.keys(props.location_list).forEach(i => {
        let value = 0;
        switch (props.location_list[i].action) {
            case "sum":
                value = Object.keys(props.data).reduce(function (previous, key) {
                    return previous + props.data[key][i];
                }, 0);
                 break; 
        } 
        tmp[props.location_list[i].position] = <td key={props.location_list[i].position}>{value}</td>;
    });  
    return (<tr>{tmp}</tr>);
}
