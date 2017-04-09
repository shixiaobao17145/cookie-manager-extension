import React from 'react'
import { Collapse,Table,Input,Popover,Button,Col,Popconfirm } from 'antd';
let InputGroup = Input.Group;
import { cache, setCookie, removeCookie, init, emitter } from '../apis/Cookies';
import * as Cookies from '../apis/Cookies';

export default class CookieTable extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			expandDomain:''
		}
	}
	onActiveChange(key){
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
		window.Cookies = Cookies;
		emitter.on('change', ()=>{
			this.setState({
				domains:cache.getDomains(this.props.filterKey)
			});
		});
	}
	renderCookies(cks){
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
				let popover;
				let content = (
					<InputGroup size="large">
					    <Col span="20">
					        <Input defaultValue="localhost" ref={(ipt)=>{input=ipt;}}/>
					    </Col>
					    <Col span="4">
					        <Button type="primary" onClick={()=>this.shareCookie(what, cookie, input)}>Ok</Button>
					    </Col>
					</InputGroup>
				);
				return (
					<div>
						<Popover content={content} title="Share to Domain" trigger="click">
							<Button type="primary">Share</Button>
						</Popover>

						<Popconfirm title="Are you sure delete this cookie?" onConfirm={()=>this.deleteCookie(what, cookie)}  okText="Yes" cancelText="No" >
							<Button className="btn-space" type="danger">Delete</Button>
						</Popconfirm>
					</div>
				)
			}
		}];
		return (
			<Table columns={columns}
				   rowKey={(record)=>{
						   let {domain, name, path} = record;
						   return [domain, name,path].join(' | ');
					   }}
				   dataSource={cks}
				   pagination={false}
				   showHeader={true}/>
		)
	}
	render(){
		let { filterKey } = this.props;
//		console.log('filterKey', filterKey);
		
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
