export default class MySuggestionBox extends React.Component {
    state = { isShow: false, inputStr: this.props.value };
    setInputStr(e) {
        this.setState({ isShow: false, inputStr: e }, () => {
            let tmp_e = {};
            tmp_e['target'] = {};
            tmp_e['target']['step'] = 0;
            tmp_e['target']['type'] = 'text';
            tmp_e['target']['name'] = this.props.name;
            tmp_e['target']['value'] = this.state.inputStr;
            this.props.stateHnadler(this.props.rowID, tmp_e, this.props.tableName);
        });
    }
    handleFieldChg(e) {
        this.setState({ inputStr: e.target.value });
        this.props.stateHnadler(this.props.rowID, e, this.props.tableName);
    }
    getSuggestList(d) { 
        return d.map((i, k) => (
            <span className="roundedSubItem" id={this.props.relative_row_id % 2 === 0 ? 'even_row' : 'odd_row'}
                key={k} onClick={e => this.setInputStr(e.currentTarget.textContent)}>
                {i}
            </span>
        ));
    }
    render() {
        return (
            <div>
                <div className="inlineItems">
                    <input type="text" onChange={e => this.handleFieldChg(e)} value={this.state.inputStr} 
                        className={this.props.className !== "" ? this.props.className : "marginedInputBox"}
                        name={this.props.name} list={this.props.suggest_list_name} />
                    <span className="moreBtn" onMouseEnter={() => this.setState({ isShow: !this.state.isShow })} ></span>
                </div>
                <div style={this.state.isShow ? { visibility: "visible" } : { visibility: "hidden" }}>
                    {this.getSuggestList(this.props.suggest_btn)}
                </div>
            </div>
        );
    }
}
