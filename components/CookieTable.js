import React from 'react'
import { Collapse,Table,Input,Popover,Button,Col,Popconfirm } from 'antd';
let InputGroup = Input.Group;
import { cache, setCookie, removeCookie, init, emitter } from '../apis/Cookies';

export default class CookieTable extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			expandDomain:''
		}
	}
	onActiveChange(key){
		console.log(arguments);
		this.setState({
			expandDomain:key
		});
	}
	renderDomain(domain){
		let Panel = Collapse.Panel;
		let cks = cache.getCookies(domain);
		let header = domain + " | #" + cks.length;
		return (
			<Panel header={header} key={domain}>
				{
					this.state.expandDomain == domain && this.renderCookies(cks)
				}
			</Panel>
		)
	}
	shareCookie(what,cookie, input){
		let shareToDomain = input.refs.input.value;
		console.log('cookie', cookie, shareToDomain);
		let newCookie = Object.assign({}, cookie);
		delete newCookie.domain;
		setCookie(shareToDomain, newCookie, function(){
			console.log('after sharing...', arguments);
		});
	}
	deleteCookie(what, cookie){
		console.log(what, cookie);
		removeCookie(cookie);
	}
	componentDidMount(){
		init();
		emitter.on('change', ()=>{
			this.setState({
				domains:cache.getDomains(this.props.filterKey)
			});
		});
	}
	renderCookies(cks){
		let shareCookie = this.shareCookie.bind(this);
		let deleteCookie = this.deleteCookie.bind(this);
		const columns = [{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			width:100
		},{
			title: 'Value',
			dataIndex: 'value',
			key: 'value'
		},{
			title: 'Path',
			dataIndex: 'path',
			key: 'path',
			width:200
		},{
			title: 'Expiration',
			dataIndex: 'expirationDate',
			key: 'expirationDate',
			width:200,
			render:text => {
				let out="";
				if(text){
					out = new Date(text * 1000).toLocaleString()
				}
				return out;
			}
		},{
			title:'Actions',
			dataIndex:'actions',
			key:'share',
			width:190,
			render:(what, cookie)=>{
				let input;
				let content = (
					<InputGroup size="large">
					    <Col span="15">
					        <Input defaultValue="localhost" ref={(ipt)=>{input=ipt;}}/>
					    </Col>
					    <Col span="9">
					        <Button onClick={()=>shareCookie(what, cookie, input)}>Ok</Button>
					    </Col>
					</InputGroup>
				);
				return (
					<div>
						<Popover content={content} title="Share to Domain" trigger="click">
							<Button>Share</Button>
						</Popover>

						<Popconfirm title="Are you sure delete this cookie?" onConfirm={()=>deleteCookie(what, cookie)}  okText="Yes" cancelText="No" >
							&nbsp;<Button>Delete</Button>
						</Popconfirm>
					</div>
				)
			}
		}];
		return (
			<Table columns={columns}
				   rowKey={(record)=>{
						   return record.domain + "|" + record.name + Math.random()
					   }}
				   dataSource={cks}
				   pagination={false}
				   showHeader={true}/>
		)
	}
	render(){
		let { filterKey } = this.props;
		console.log('filterKey', filterKey);
		
		return (
			<Collapse  onChange={(key)=>this.onActiveChange(key)} accordion>
				{
					cache.getDomains(filterKey).map((domain)=>{
						return this.renderDomain(domain);
					})
				}
			</Collapse>)
	}
}
